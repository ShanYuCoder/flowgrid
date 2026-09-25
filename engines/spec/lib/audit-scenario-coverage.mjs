#!/usr/bin/env node

/**
 * audit-scenario-coverage.mjs
 * Verify each screen listed on a cross-flow SC has testcase coverage or explicit deferral.
 */

import fs from 'fs';
import path from 'path';

function parseFrontmatter(rawText) {
  const fm = rawText.match(/^---\s*\n([\s\S]*?)\n---/);
  return fm ? fm[1] : rawText;
}

function parseScreens(yamlLike) {
  const screens = new Set();
  const listMatch = yamlLike.match(/screens:\s*\[([^\]]+)\]/);
  if (listMatch) {
    for (const m of listMatch[1].matchAll(/(W-[\w-]+)/g)) {
      screens.add(m[1]);
    }
  }
  const blockMatch = yamlLike.match(/^screens:\s*$/m);
  if (blockMatch) {
    const tail = yamlLike.slice(blockMatch.index);
    const lines = tail.split('\n').slice(1);
    for (const line of lines) {
      if (/^\S/.test(line)) break;
      if (/^\s{0,3}\w[\w-]*:\s*/.test(line) && !/^\s*-\s/.test(line)) break;
      for (const m of line.matchAll(/(W-[\w-]+)/g)) {
        screens.add(m[1]);
      }
    }
  }
  const single = yamlLike.match(/^\s*screen:\s*(W-[\w-]+)/m);
  if (single) screens.add(single[1]);
  return [...screens];
}

function parseDeferred(yamlLike) {
  const deferred = new Map();
  for (const m of yamlLike.matchAll(
    /deferred:\s*(QA-[\w-]+)[\s\S]*?(?:screen:\s*(W-[\w-]+)|#\s*screen:\s*(W-[\w-]+))?/g,
  )) {
    const qa = m[1];
    const screen = m[2] || m[3];
    if (screen) deferred.set(screen, qa);
  }
  const block = yamlLike.match(/coverage_deferred:\s*\n((?:\s+-\s*.+\n)+)/);
  if (block) {
    for (const line of block[1].split('\n')) {
      const pair = line.match(/screen:\s*(W-[\w-]+).*deferred:\s*(QA-[\w-]+)/);
      if (pair) deferred.set(pair[1], pair[2]);
      const pair2 = line.match(/deferred:\s*(QA-[\w-]+).*screen:\s*(W-[\w-]+)/);
      if (pair2) deferred.set(pair2[2], pair2[1]);
    }
  }
  return deferred;
}

function collectTcScreens(testsRoot) {
  const covered = new Set();
  const walk = (dir) => {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (e.name === 'node_modules' || e.name === '.git') continue;
        walk(full);
      } else if (/\.(ya?ml|md)$/i.test(e.name) && /TC/i.test(e.name)) {
        try {
          const text = fs.readFileSync(full, 'utf8');
          for (const m of text.matchAll(/screen:\s*(W-[\w-]+)/g)) {
            covered.add(m[1]);
          }
          for (const m of text.matchAll(/screen:\s*(W-[\w-]+)/g)) {
            covered.add(m[1]);
          }
        } catch {
          /* ignore */
        }
      }
    }
  };
  walk(testsRoot);
  return covered;
}

export function auditScenarioCoverage(scText, meta = {}) {
  const gaps = [];
  const filePath = meta.filePath ?? '';
  const testsRoot = meta.testsRoot ?? process.cwd();
  const fm = parseFrontmatter(scText);
  const screens = parseScreens(fm);
  const deferred = parseDeferred(fm);
  const covered = collectTcScreens(testsRoot);

  function addGap(code, severity, fieldPath, message, suggestedFix) {
    gaps.push({ code, severity, path: fieldPath, message, suggestedFix, category: 'scenario-coverage' });
  }

  if (screens.length === 0) {
    addGap(
      'SC_MISSING_SCREENS',
      'critical',
      'screens',
      'Scenario file missing screens: [W-*] list in frontmatter.',
      'Add screens: [W-…] for every W-* touched by this FLOW journey.',
    );
  }

  for (const screen of screens) {
    if (deferred.has(screen)) continue;
    if (!covered.has(screen)) {
      addGap(
        'SC_SCREEN_NO_TC',
        'warning',
        `screens.${screen}`,
        `No testcase under tests root references screen ${screen}.`,
        `Add cases/**/TC-*.yaml with refs.screen: ${screen} or defer with coverage_deferred entry (QA-*).`,
      );
    }
  }

  return {
    file: filePath,
    testsRoot,
    screens,
    deferred: Object.fromEntries(deferred),
    coveredScreens: [...covered].filter((s) => screens.includes(s)),
    totalGaps: gaps.length,
    criticalGaps: gaps.filter((g) => g.severity === 'critical').length,
    warningGaps: gaps.filter((g) => g.severity === 'warning').length,
    gaps,
  };
}

function parseArgs(argv) {
  let testsRoot = process.cwd();
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--tests-root' && argv[i + 1]) {
      testsRoot = path.resolve(process.cwd(), argv[++i]);
    } else {
      positional.push(argv[i]);
    }
  }
  return { scPath: positional[0], testsRoot };
}

// CLI
const cliArgs = process.argv.slice(2);
if (cliArgs.length === 0) {
  console.log(
    'Usage: node audit-scenario-coverage.mjs <SC.yaml|SC.md> [--tests-root path/to/tests-hub]',
  );
  process.exit(0);
}

const { scPath, testsRoot } = parseArgs(cliArgs);
const resolved = path.resolve(process.cwd(), scPath);
if (!fs.existsSync(resolved)) {
  console.error(JSON.stringify({ error: `File not found: ${resolved}` }));
  process.exit(1);
}
const scText = fs.readFileSync(resolved, 'utf8');
const report = auditScenarioCoverage(scText, { filePath: resolved, testsRoot });
console.log(JSON.stringify(report, null, 2));
