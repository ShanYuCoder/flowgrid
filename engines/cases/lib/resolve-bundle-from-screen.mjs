import fs from 'node:fs'
import path from 'node:path'
import { resolveHubId } from '../../testcase/runners/lib/resolve-hub-id.mjs'

/**
 * Resolve function *.bundle.yaml from docs hub using W-* screen id.
 * @param {string} projectRoot — tests hub or FE repo root (for platform-repos)
 * @param {string} screenId
 * @param {{ docsRoot?: string }} [opts]
 * @returns {string | null} absolute bundle path
 */
export function resolveBundleFromScreen(projectRoot, screenId, opts = {}) {
  const prev = process.env.FLOWGRID_DOCS_ROOT
  if (opts.docsRoot) {
    process.env.FLOWGRID_DOCS_ROOT = path.resolve(opts.docsRoot)
  }
  try {
    const resolved = resolveHubId(projectRoot, screenId, 'codegen')
    const designPath = resolved.paths?.[0]
    if (!designPath) return null
    const featureDir = path.dirname(path.dirname(designPath))
    if (!fs.existsSync(featureDir)) return null
    const bundle = fs
      .readdirSync(featureDir)
      .find((f) => f.endsWith('.bundle.yaml'))
    if (bundle) return path.join(featureDir, bundle)
  } catch {
    if (opts.docsRoot) {
      return findBundleByScreenWalk(opts.docsRoot, screenId)
    }
  } finally {
    if (opts.docsRoot) {
      if (prev === undefined) delete process.env.FLOWGRID_DOCS_ROOT
      else process.env.FLOWGRID_DOCS_ROOT = prev
    }
  }
  return null
}

function findBundleByScreenWalk(docsRoot, screenId) {
  const hits = []
  const walk = (dir, depth) => {
    if (depth > 12) return
    let entries
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true })
    } catch {
      return
    }
    for (const e of entries) {
      if (e.name.startsWith('.') || e.name === 'node_modules') continue
      const full = path.join(dir, e.name)
      if (e.isDirectory()) walk(full, depth + 1)
      else if (e.name.endsWith('.bundle.yaml')) {
        try {
          const text = fs.readFileSync(full, 'utf8')
          if (
            text.includes(screenId) ||
            new RegExp(`^page-id:\\s*["']?${screenId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'm').test(
              text,
            )
          ) {
            hits.push(full)
          }
        } catch {
          /* ignore */
        }
      }
    }
  }
  walk(path.join(docsRoot, 'surfaces'), 0)
  return hits[0] ?? null
}
