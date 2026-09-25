import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { runDoctor } from '../bin/lib/doctor.mjs';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('doctor on empty dir warns about missing config', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'flowgrid-doctor-'));
  try {
    const report = runDoctor({ projectRoot: tmpDir, packageRoot, log: () => {} });
    assert.strictEqual(report.ok, true);
    assert.ok(report.warnings.some((w) => w.includes('config.json')));
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('doctor flags missing MCP flowgrid server', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'flowgrid-doctor-'));
  try {
    fs.mkdirSync(path.join(tmpDir, '.flowgrid'), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, '.flowgrid', 'config.json'),
      JSON.stringify({ type: 'Document', agents: ['cursor'] }),
    );
    fs.mkdirSync(path.join(tmpDir, '.cursor'), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, '.cursor', 'mcp.json'),
      JSON.stringify({ mcpServers: {} }),
    );
    const report = runDoctor({ projectRoot: tmpDir, packageRoot, log: () => {} });
    assert.strictEqual(report.ok, false);
    assert.ok(report.issues.some((i) => i.includes('flowgrid')));
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('doctor toolkit checks pass on monorepo package root', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'flowgrid-doctor-'));
  try {
    const report = runDoctor({ projectRoot: tmpDir, packageRoot, log: () => {} });
    assert.ok(!report.issues.some((i) => i.includes('Toolkit missing')));
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});
