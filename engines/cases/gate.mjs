#!/usr/bin/env node
/**
 * flowgrid cases:gate — schema + audit + bundle traceability + per-screen facets (+ optional SC coverage).
 *
 * Usage:
 *   flowgrid cases:gate [--strict] [--docs-root path] [--json] [--no-coverage]
 */
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { listCaseYamlUnderProject } from './lib/list-case-yaml.mjs'
import { validateTcFile } from './lib/validate-tc-schema.mjs'
import { resolveBundleFromScreen } from './lib/resolve-bundle-from-screen.mjs'
import { auditTcTraceability } from './lib/audit-tc-traceability.mjs'
import { auditScreenFacetCoverage } from './lib/screen-facet-coverage.mjs'
import {
  auditTestcaseTcFile,
  isTestCaseArtifact,
} from '../spec/lib/audit-testcase-tc.mjs'
import { auditTestcasePlanContent } from '../spec/lib/audit-testcase-plan-gaps.mjs'
import { auditTestcaseBundleCross } from '../spec/lib/audit-testcase-bundle-cross.mjs'

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

function parseArgs(argv) {
  let strict = false
  let json = false
  let noCoverage = false
  let docsRoot = process.env.FLOWGRID_DOCS_ROOT || null
  const positional = []
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--strict') strict = true
    else if (a === '--json') json = true
    else if (a === '--no-coverage') noCoverage = true
    else if (a === '--docs-root' && argv[i + 1]) docsRoot = argv[++i]
    else if (a === '--help' || a === '-h') positional.push('__help__')
    else positional.push(a)
  }
  return { strict, json, noCoverage, docsRoot, projectRoot: positional[0] }
}

function gapBlocks(gap, strict) {
  if (gap.severity === 'critical') return true
  if (strict && (gap.severity === 'warning' || gap.severity === 'info')) return true
  return false
}

async function main() {
  const { strict, json, noCoverage, docsRoot, projectRoot: rootArg } = parseArgs(
    process.argv.slice(2),
  )
  if (rootArg === '__help__') {
    console.log(`Usage: flowgrid cases:gate [--strict] [--docs-root <docs-hub>] [--json] [--no-coverage]
  Runs JSON Schema (v2), audit testcase, bundle traceability, per-screen matrix facets, and cases:coverage.`)
    process.exit(0)
  }

  const projectRoot = path.resolve(rootArg || process.cwd())
  const files = await listCaseYamlUnderProject(projectRoot)
  const report = {
    ok: true,
    strict,
    projectRoot,
    docsRoot: docsRoot || process.env.FLOWGRID_DOCS_ROOT || null,
    fileCount: files.length,
    gaps: [],
    files: [],
  }

  if (!files.length) {
    report.gaps.push({
      code: 'GATE_NO_TC_FILES',
      severity: 'warning',
      path: 'cases',
      message: 'No TC-*.yaml under cases/.',
      suggestedFix: 'Author testcase YAML under cases/ mirroring docs hub.',
      category: 'gate',
    })
  }

  const parsedForScreen = []

  for (const file of files) {
    const raw = await readFile(file, 'utf8')
    const rel = path.relative(projectRoot, file)
    const fileReport = { file: rel, schema: true, audit: true, bundle: null }

    const schemaResult = await validateTcFile(file, projectRoot)
    if (!schemaResult.ok) {
      report.ok = false
      fileReport.schema = false
      for (const err of schemaResult.errors) {
        report.gaps.push({
          code: 'TC_SCHEMA_INVALID',
          severity: 'critical',
          path: rel,
          message: err,
          suggestedFix: 'Fix YAML to match schemas/testcase.schema.json (schemaVersion: 2).',
          category: 'schema',
        })
      }
    }

    const data = schemaResult.data
    if (data) parsedForScreen.push({ file: rel, data })

    let auditReport
    if (isTestCaseArtifact(file, raw)) {
      auditReport = auditTestcaseTcFile(raw, file)
    } else {
      auditReport = auditTestcasePlanContent(raw, file)
    }
    for (const g of auditReport.gaps) {
      if (gapBlocks(g, strict)) report.ok = false
      report.gaps.push({ ...g, file: rel })
    }

    const screen = data?.refs?.screen
    if (screen && typeof screen === 'string') {
      const bundlePath = resolveBundleFromScreen(projectRoot, screen, { docsRoot })
      if (bundlePath) {
        fileReport.bundle = path.relative(projectRoot, bundlePath)
        const bundleText = await readFile(bundlePath, 'utf8')
        if (data && strict) {
          const trace = auditTcTraceability(data, bundleText, {
            strict: true,
            bundlePath,
          })
          for (const g of trace.gaps) {
            if (gapBlocks(g, strict)) report.ok = false
            report.gaps.push({ ...g, file: rel, bundle: fileReport.bundle })
          }
        } else if (data) {
          const trace = auditTcTraceability(data, bundleText, {
            strict: false,
            bundlePath,
          })
          for (const g of trace.gaps) {
            if (gapBlocks(g, false) && g.severity === 'critical') report.ok = false
            if (g.severity !== 'info' || strict) report.gaps.push({ ...g, file: rel, bundle: fileReport.bundle })
          }
          const cross = auditTestcaseBundleCross(bundleText, raw, bundlePath)
          for (const g of cross.bundleCrossGaps) {
            if (strict && gapBlocks({ ...g, severity: g.severity === 'info' ? 'warning' : g.severity }, strict)) {
              report.ok = false
            }
            if (!strict || g.severity !== 'info') {
              report.gaps.push({ ...g, file: rel, bundle: fileReport.bundle })
            }
          }
        }
      } else if (strict) {
        report.ok = false
        report.gaps.push({
          code: 'GATE_BUNDLE_UNRESOLVED',
          severity: 'critical',
          path: rel,
          message: `Could not resolve *.bundle.yaml for screen ${screen} (set --docs-root or FLOWGRID_DOCS_ROOT).`,
          suggestedFix: 'Point docs hub root or pass --bundle manually on audit testcase.',
          category: 'gate',
        })
      }
    }

    report.files.push(fileReport)
  }

  const screenFacets = auditScreenFacetCoverage(parsedForScreen, { strict })
  for (const g of screenFacets.gaps) {
    if (gapBlocks(g, strict)) report.ok = false
    report.gaps.push(g)
  }

  if (!noCoverage && files.length) {
    const cov = spawnSync(process.execPath, [path.join(packageRoot, 'engines/cases/check-coverage.mjs')], {
      cwd: projectRoot,
      encoding: 'utf8',
    })
    if (cov.status !== 0) {
      report.ok = false
      report.gaps.push({
        code: 'GATE_SC_COVERAGE_FAILED',
        severity: strict ? 'critical' : 'warning',
        path: 'scenarios',
        message: (cov.stderr || cov.stdout || 'cases:coverage failed').trim().slice(0, 500),
        suggestedFix: 'Align SC coverage_plan with TC coverage[] per scenario.',
        category: 'sc-coverage',
      })
    }
  }

  report.criticalGaps = report.gaps.filter((g) => g.severity === 'critical').length
  report.warningGaps = report.gaps.filter((g) => g.severity === 'warning').length

  if (json) {
    console.log(JSON.stringify(report, null, 2))
  } else if (report.ok) {
    console.log(`cases:gate OK (${files.length} TC file(s), strict=${strict})`)
  } else {
    console.error('cases:gate FAILED')
    for (const g of report.gaps) {
      console.error(`  [${g.severity}] ${g.code} ${g.file ? g.file + ' — ' : ''}${g.message}`)
    }
  }

  process.exit(report.ok ? 0 : 1)
}

main().catch((e) => {
  console.error('cases:gate FAILED')
  console.error(`  - ${e.message}`)
  process.exit(1)
})
