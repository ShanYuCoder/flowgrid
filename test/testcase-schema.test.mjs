import test from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { isTestCaseArtifact } from '../engines/spec/lib/audit-testcase-tc.mjs';
import { auditScreenFacetCoverage } from '../engines/cases/lib/screen-facet-coverage.mjs';
import { parseBundleTraceability, scenarioToSlug } from '../engines/cases/lib/parse-bundle-traceability.mjs';

const rootDir = process.cwd();
const auditTestcasePath = path.join(rootDir, 'engines/spec/lib/audit-testcase-gaps.mjs');
const checkPlansPath = path.join(rootDir, 'engines/cases/check-plans.mjs');
const goldenTc = path.join(rootDir, 'harness/tests/templates/TC.example.yaml');

test('TC.example.yaml — audit tc-file (0 critical)', () => {
  const output = execSync(`node "${auditTestcasePath}" "${goldenTc}"`, { encoding: 'utf8' });
  const report = JSON.parse(output);
  assert.equal(report.artifactKind, 'tc-file');
  assert.equal(report.schemaVersion, 2);
  assert.equal(report.criticalGaps, 0, JSON.stringify(report.gaps.filter((g) => g.severity === 'critical')));
  assert.equal(report.matrixFacets?.length, 6);
});

test('TC.example.yaml — cases:check schema v2', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'flowgrid-tc-schema-'));
  const casesDir = path.join(tmpDir, 'cases', 'example');
  fs.mkdirSync(casesDir, { recursive: true });
  fs.copyFileSync(goldenTc, path.join(casesDir, 'TC-EXAMPLE-VALID.yaml'));
  try {
    const output = execSync(`node "${checkPlansPath}"`, { cwd: tmpDir, encoding: 'utf8' });
    assert.match(output, /check:plans OK/);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('incomplete TC-*.yaml — audit flags missing matrix facets', () => {
  withTempTc('TC-INCOMPLETE.yaml', `schemaVersion: 2
id: TC-INCOMPLETE-01
title: Incomplete
refs:
  module: CMP-01-auth
  scenario: SC-X
  screen: W-AD-AUTH-001
coverage: [happy]
testMatrix:
  - facet: positive_boundary
    description: only one
steps:
  - "Do something"
feature: x
genType: e2e
route:
  path: /x
testIds:
  required: [btn_x]
`, (filePath) => {
    const output = execSync(`node "${auditTestcasePath}" "${filePath}"`, { encoding: 'utf8' });
    const report = JSON.parse(output);
    assert.ok(report.gaps.some((g) => g.code === 'TC_MATRIX_MISSING_FACET'));
  });
});

test('isTestCaseArtifact — TC file vs legacy plan', () => {
  assert.equal(isTestCaseArtifact('/cases/TC-LOGIN.yaml', 'id: TC-1\n'), true);
  assert.equal(isTestCaseArtifact('/plans/foo.test.yaml', 'testcases:\n  - id: 1\n'), false);
});

test('auditScreenFacetCoverage — unions facets across TC files on same screen', () => {
  const { gaps } = auditScreenFacetCoverage(
    [
      {
        file: 'a.yaml',
        data: {
          refs: { screen: 'W-AD-001' },
          testMatrix: [{ facet: 'positive_boundary' }, { facet: 'negative_length' }],
        },
      },
      {
        file: 'b.yaml',
        data: {
          refs: { screen: 'W-AD-001' },
          testMatrix: [{ facet: 'negative_format' }, { facet: 'negative_duplicate' }],
        },
      },
    ],
    { strict: true },
  );
  const missing = gaps.filter((g) => g.code === 'TC_SCREEN_FACET_GAP');
  assert.equal(missing.length, 2);
  assert.ok(missing.some((g) => g.path.includes('concurrency_double_submit')));
});

test('parseBundleTraceability — AC ids and scenario slugs', () => {
  const bundle = `
page-id: W-X-001
userStories:
  scenarios:
    - name: "Initial Load (Smoke)"
  acceptanceCriteria:
    - "[ ] First AC"
    - "[ ] Second AC"
`;
  const inv = parseBundleTraceability(bundle);
  assert.equal(inv.acceptance[0].id, 'AC-01');
  assert.equal(inv.acceptance[1].id, 'AC-02');
  assert.equal(scenarioToSlug('Initial Load (Smoke)'), 'smoke');
});

function withTempTc(name, content, fn) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'flowgrid-tc-audit-'));
  const filePath = path.join(tmpDir, name);
  fs.writeFileSync(filePath, content, 'utf8');
  try {
    fn(filePath);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}
