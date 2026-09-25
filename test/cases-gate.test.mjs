import test from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { auditTcTraceability } from '../engines/cases/lib/audit-tc-traceability.mjs';

const rootDir = process.cwd();
const gatePath = path.join(rootDir, 'engines/cases/gate.mjs');
const goldenTc = path.join(rootDir, 'harness/tests/templates/TC.example.yaml');

test('auditTcTraceability — strict requires acceptanceRefs', () => {
  const bundle = `
page-id: W-AD-AUTH-001
userStories:
  scenarios:
    - name: "Initial Load (Smoke)"
  acceptanceCriteria:
    - "[ ] User can access screen"
design:
  actions:
    - id: btn_save_record
      outcomes:
        onSuccess: {}
`;
  const tc = {
    schemaVersion: 2,
    refs: { screen: 'W-AD-AUTH-001', scenario: 'SC-X', module: 'CMP-01-auth' },
    traceability: {
      bundleScreen: 'W-AD-AUTH-001',
      bundleScenarios: ['smoke'],
      acceptanceRefs: [],
      actionRefs: ['btn_save_record'],
    },
    testMatrix: [{ facet: 'positive_boundary', expected: {} }],
  };
  const report = auditTcTraceability(tc, bundle, { strict: true });
  assert.ok(report.gaps.some((g) => g.code === 'TC_TRACE_AC_MISSING'));
});

test('cases:gate — non-strict passes golden TC in isolated cases/', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'flowgrid-gate-'));
  const casesDir = path.join(tmpDir, 'cases', 'auth');
  fs.mkdirSync(casesDir, { recursive: true });
  fs.copyFileSync(goldenTc, path.join(casesDir, 'TC-EXAMPLE-VALID.yaml'));
  try {
    const output = execSync(`node "${gatePath}" --no-coverage`, {
      cwd: tmpDir,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    assert.match(output, /cases:gate OK/);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('cases:gate — strict fails without docs bundle', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'flowgrid-gate-strict-'));
  const casesDir = path.join(tmpDir, 'cases', 'auth');
  fs.mkdirSync(casesDir, { recursive: true });
  fs.copyFileSync(goldenTc, path.join(casesDir, 'TC-EXAMPLE-VALID.yaml'));
  try {
    let failed = false;
    try {
      execSync(`node "${gatePath}" --strict --no-coverage`, {
        cwd: tmpDir,
        encoding: 'utf8',
        stdio: 'pipe',
      });
    } catch {
      failed = true;
    }
    assert.equal(failed, true);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});
