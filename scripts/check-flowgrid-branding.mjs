#!/usr/bin/env node
/**
 * CI guard: FlowGrid product naming in harness, docs, bin, templates, engines.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const SKIP_DIRS = new Set(['node_modules', 'dist', '.git', '.vitepress', 'cache', 'obj']);

const SCAN_ROOTS = ['harness', 'bin', 'docs', 'templates', 'scripts', 'engines'];

const EXT = new Set(['.md', '.mdc', '.mjs', '.ts', '.json', '.yaml', '.yml']);

/** Pre-FlowGrid kit names must not appear in product sources. */
const FORBIDDEN = [
  /\bforgekit\b/i,
  /\bdocskit\b/i,
  /\bcodegenkit\b/i,
  /\btestkit\b/i,
  /\bprocesskit\b/i,
];

const ALLOW_FILE = new Set(['scripts/check-flowgrid-branding.mjs']);

function lineAllowed(fileRel, line) {
  if (ALLOW_FILE.has(fileRel)) return true;
  if (fileRel.includes('docs/.vitepress/cache')) return true;
  if (/\bflowgrid_docs_/i.test(line)) return true;
  if (/<!--\s*flowgrid(?:-test)?-catalog\s*-->/.test(line)) return true;
  return false;
}

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(ent.name)) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(full, out);
    else {
      const rel = path.relative(root, full);
      const ext = path.extname(ent.name);
      if (EXT.has(ext)) out.push({ full, rel });
    }
  }
  return out;
}

const violations = [];
for (const sub of SCAN_ROOTS) {
  for (const { full, rel } of walk(path.join(root, sub))) {
    const lines = fs.readFileSync(full, 'utf8').split('\n');
    lines.forEach((line, idx) => {
      if (lineAllowed(rel, line)) return;
      for (const re of FORBIDDEN) {
        if (re.test(line)) {
          violations.push({ file: rel, line: idx + 1, text: line.trim().slice(0, 140) });
          break;
        }
      }
    });
  }
}

if (violations.length) {
  console.error(`Non-FlowGrid branding found (${violations.length}):`);
  for (const v of violations.slice(0, 40)) {
    console.error(`  ${v.file}:${v.line}  ${v.text}`);
  }
  if (violations.length > 40) {
    console.error(`  … and ${violations.length - 40} more`);
  }
  process.exit(1);
}

console.log('check-flowgrid-branding: OK');
