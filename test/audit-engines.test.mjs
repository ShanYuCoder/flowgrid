import test from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';

const rootDir = process.cwd();
const auditBundlePath = path.join(rootDir, 'engines/spec/lib/audit-bundle-gaps.mjs');
const auditApiPath = path.join(rootDir, 'engines/spec/lib/audit-api-gaps.mjs');
const auditTestcasePath = path.join(rootDir, 'engines/spec/lib/audit-testcase-gaps.mjs');
const auditLegacyPath = path.join(rootDir, 'engines/spec/lib/audit-legacy-gaps.mjs');
const auditFlowPath = path.join(rootDir, 'engines/spec/lib/audit-flow-gaps.mjs');
const auditFeBePath = path.join(rootDir, 'engines/spec/lib/audit-fe-be-alignment.mjs');
const auditScenarioPath = path.join(rootDir, 'engines/spec/lib/audit-scenario-coverage.mjs');

// Helper to create temporary files for deterministic testing
function withTempFile(prefix, extension, content, callback) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), `flowgrid-test-${prefix}-`));
  const tmpFilePath = path.join(tmpDir, `test-sample.${extension}`);
  fs.writeFileSync(tmpFilePath, content, 'utf8');

  try {
    return callback(tmpFilePath);
  } finally {
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  }
}

test('Comprehensive Audit Engine Suite', async (t) => {

  // -------------------------------------------------------------------------
  // 1. AUDIT-BUNDLE-GAPS TESTS
  // -------------------------------------------------------------------------
  await t.test('audit-bundle-gaps.mjs - Page Type Detection (Explicit vs Auto-detect)', () => {
    const listBundleContent = `
title: User List Page
page-id: W-AD-USER-001
summary: User list management screen
codegen:
  profile: list
design:
  shell:
    tag: DataListPage
`;
    withTempFile('bundle-detect', 'yaml', listBundleContent, (filePath) => {
      // Auto-detect
      const outputAuto = execSync(`node "${auditBundlePath}" "${filePath}"`, { encoding: 'utf8' });
      const reportAuto = JSON.parse(outputAuto);
      assert.equal(reportAuto.detectedType, 'list');

      // Explicit --type override
      const outputExplicit = execSync(`node "${auditBundlePath}" "${filePath}" --type create`, { encoding: 'utf8' });
      const reportExplicit = JSON.parse(outputExplicit);
      assert.equal(reportExplicit.detectedType, 'create');
    });
  });

  await t.test('audit-bundle-gaps.mjs - Required Gaps & Optional Confirms on List Page', () => {
    const incompleteListContent = `
title: Incomplete List
page-id: W-AD-LIST-001
summary: Incomplete summary
userStories:
  contextAndHandoff:
    screenAccess:
      accessType: directRoute
`;
    withTempFile('bundle-list', 'yaml', incompleteListContent, (filePath) => {
      const output = execSync(`node "${auditBundlePath}" "${filePath}" --type list`, { encoding: 'utf8' });
      const report = JSON.parse(output);

      // Check required gaps
      assert.ok(report.gaps.some(g => g.code === 'INCOMPLETE_DIRECT_ROUTE'));
      assert.ok(report.gaps.some(g => g.code === 'MISSING_LIST_COLUMNS'));
      assert.ok(report.gaps.some(g => g.code === 'MISSING_EMPTY_STATE'));

      // Check optional confirms
      assert.ok(report.confirms.some(c => c.code === 'CONFIRM_LIST_SEARCH'));
      assert.ok(report.confirms.some(c => c.code === 'CONFIRM_LIST_SORT'));
      assert.ok(report.confirms.some(c => c.code === 'CONFIRM_LIST_PAGINATION'));
      assert.ok(report.confirms.some(c => c.code === 'CONFIRM_LIST_ROW_ACTIONS'));
    });
  });

  await t.test('audit-bundle-gaps.mjs - Validation & Form Gaps on Create Page', () => {
    const incompleteFormContent = `
title: Form Page
page-id: W-AD-FORM-001
summary: Form summary
userStories:
  contextAndHandoff:
    screenAccess:
      accessType: directRoute
      routePath: /create
fields:
  - key: username
    label: Username
`;
    withTempFile('bundle-form', 'yaml', incompleteFormContent, (filePath) => {
      const output = execSync(`node "${auditBundlePath}" "${filePath}" --type create`, { encoding: 'utf8' });
      const report = JSON.parse(output);

      assert.ok(report.gaps.some(g => g.code === 'MISSING_VALIDATION'));
      assert.ok(report.gaps.some(g => g.code === 'MISSING_SUBMIT'));
      assert.ok(report.confirms.some(c => c.code === 'CONFIRM_FORM_LAYOUT'));
    });
  });

  await t.test('audit-bundle-gaps.mjs - UX affordance (delete, disabledReason, list DSL)', () => {
    const deleteToastOnly = `
title: User List
page-id: W-AD-LIST-002
summary: List with delete
userStories:
  contextAndHandoff:
    screenAccess:
      accessType: directRoute
      routePath: /users
columns:
  - key: name
    title: Name
rowActions:
  - id: btn_delete
    label: Delete
actions:
  - id: btn_delete
    outcomes:
      onSuccess:
        toast: Deleted
`;
    withTempFile('bundle-ux-delete', 'yaml', deleteToastOnly, (filePath) => {
      const output = execSync(`node "${auditBundlePath}" "${filePath}" --type list`, { encoding: 'utf8' });
      const report = JSON.parse(output);
      assert.ok(report.uxAffordanceGaps >= 1);
      assert.ok(report.gaps.some((g) => g.code === 'UX_GAP_DELETE_CONFIRM'));
      assert.ok(report.gaps.some((g) => g.code === 'UX_GAP_DELETE_RESULT_DIALOG'));
      assert.ok(report.confirms.some((c) => c.code === 'CONFIRM_UX_LIST_DSL'));
    });

    const disabledNoReason = `
title: Form
page-id: W-AD-F-002
summary: Form
userStories:
  contextAndHandoff:
    screenAccess:
      accessType: directRoute
      routePath: /f
fields:
  - key: x
actions:
  - id: btn_save
    preconditions:
      uiState: valid
    disabled: true
`;
    withTempFile('bundle-ux-disabled', 'yaml', disabledNoReason, (filePath) => {
      const output = execSync(`node "${auditBundlePath}" "${filePath}" --type create`, { encoding: 'utf8' });
      const report = JSON.parse(output);
      assert.ok(report.gaps.some((g) => g.code === 'UX_GAP_DISABLED_REASON'));
    });
  });

  await t.test('audit-bundle-gaps.mjs - Mutation Actions & State Matrix Checks', () => {
    const mutationContent = `
title: Order Action
page-id: W-AD-ORD-001
summary: Action summary
userStories:
  contextAndHandoff:
    screenAccess:
      accessType: directRoute
      routePath: /orders/action
actions:
  - id: btn_submit
    label: Submit Order
`;
    withTempFile('bundle-mutation', 'yaml', mutationContent, (filePath) => {
      const output = execSync(`node "${auditBundlePath}" "${filePath}" --type admin-crud`, { encoding: 'utf8' });
      const report = JSON.parse(output);

      assert.ok(report.gaps.some(g => g.code === 'MISSING_STATE_MATRIX'));
      assert.ok(report.gaps.some(g => g.code === 'MISSING_ACTION_PRECONDITIONS'));
      assert.ok(report.gaps.some(g => g.code === 'MISSING_DOUBLE_SUBMIT'));
      assert.ok(report.gaps.some(g => g.code === 'MISSING_OUTCOMES'));
    });
  });

  // -------------------------------------------------------------------------
  // 2. AUDIT-API-GAPS TESTS
  // -------------------------------------------------------------------------
  await t.test('audit-api-gaps.mjs - Missing Endpoints, SLA, and Error Storming Matrix', () => {
    const incompleteApiContent = `
info:
  title: Incomplete API Contract
endpoints:
  - path: /api/v1/orders
`;
    withTempFile('api-gaps', 'yaml', incompleteApiContent, (filePath) => {
      const output = execSync(`node "${auditApiPath}" "${filePath}"`, { encoding: 'utf8' });
      const report = JSON.parse(output);

      assert.ok(report.gaps.some(g => g.code === 'API_MISSING_METHOD'));
      assert.ok(report.gaps.some(g => g.code === 'API_MISSING_MEANING_PURPOSE'));
      assert.ok(report.gaps.some(g => g.code === 'API_MISSING_SLA'));
      assert.ok(report.gaps.some(g => g.code === 'API_MISSING_ERROR_MATRIX'));
      assert.ok(report.gaps.some(g => g.code === 'API_MISSING_REQUEST_DTO'));
      assert.ok(report.gaps.some(g => g.code === 'API_MISSING_RESPONSE_DTO'));
    });
  });

  await t.test('audit-api-gaps.mjs - Integration Adapter Resilience & DLQ Check', () => {
    const integrationApiContent = `
info:
  title: Partner Payment Integration
endpoints:
  - path: /api/v1/partner/checkout
    method: POST
`;
    withTempFile('integration-api', 'yaml', integrationApiContent, (filePath) => {
      const output = execSync(`node "${auditApiPath}" "${filePath}"`, { encoding: 'utf8' });
      const report = JSON.parse(output);

      assert.ok(report.gaps.some(g => g.code === 'INTEGRATION_MISSING_RESILIENCE'));
      assert.ok(report.gaps.some(g => g.code === 'INTEGRATION_MISSING_DATA_MAPPING'));
    });
  });

  // -------------------------------------------------------------------------
  // 3. AUDIT-TESTCASE-GAPS TESTS
  // -------------------------------------------------------------------------
  await t.test('audit-testcase-gaps.mjs - --bundle cross-reference scenarios', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'flowgrid-test-tc-bundle-'));
    const bundlePath = path.join(tmpDir, 'foo.bundle.yaml');
    const tcPath = path.join(tmpDir, 'plan.test.yaml');
    const bundleContent = `
userStories:
  scenarios:
    - name: "Only Uncovered Scenario XYZ"
  acceptanceCriteria:
    - "[ ] Must verify orphan AC line unique token"
design:
  actions:
    - id: btn_orphan_action
      outcomes:
        onSuccess:
          toast: ok
`;
    const tcContent = `
testcases:
  - id: TC-1
    title: Initial Load success validation Happy Path 409 error boundary double concurrency RBAC permission role empty
`;
    try {
      fs.writeFileSync(bundlePath, bundleContent, 'utf8');
      fs.writeFileSync(tcPath, tcContent, 'utf8');
      const output = execSync(
        `node "${auditTestcasePath}" "${tcPath}" --bundle "${bundlePath}"`,
        { encoding: 'utf8' },
      );
      const report = JSON.parse(output);
      assert.ok(report.bundleCrossGaps?.length > 0);
      assert.ok(report.gaps.some((g) => g.code === 'TC_BUNDLE_SCENARIO_UNCOVERED'));
      assert.ok(report.gaps.some((g) => g.code === 'TC_BUNDLE_AC_UNCOVERED'));
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  await t.test('audit-testcase-gaps.mjs - Comprehensive Test Coverage (Boundary, Concurrency, RBAC)', () => {
    const incompleteTcContent = `
title: User Management Test Plan
testcases:
  - id: TC-001
    title: Basic login
`;
    withTempFile('tc-gaps', 'yaml', incompleteTcContent, (filePath) => {
      const output = execSync(`node "${auditTestcasePath}" "${filePath}"`, { encoding: 'utf8' });
      const report = JSON.parse(output);

      assert.ok(report.gaps.some(g => g.code === 'TC_MISSING_INITIAL_LOAD'));
      assert.ok(report.gaps.some(g => g.code === 'TC_MISSING_VALIDATION_CASE'));
      assert.ok(report.gaps.some(g => g.code === 'TC_MISSING_HAPPY_PATH'));
      assert.ok(report.gaps.some(g => g.code === 'TC_MISSING_EXCEPTION_CASE'));
      assert.ok(report.gaps.some(g => g.code === 'TC_MISSING_BOUNDARY_MATRIX'));
      assert.ok(report.gaps.some(g => g.code === 'TC_MISSING_DOUBLE_SUBMIT'));
      assert.ok(report.gaps.some(g => g.code === 'TC_MISSING_RBAC_CASE'));
      assert.ok(report.gaps.some(g => g.code === 'TC_MISSING_EMPTY_STATE'));
    });
  });

  await t.test('audit-fe-be-alignment.mjs - apiRef mapping', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'flowgrid-test-febe-'));
    const bundlePath = path.join(tmpDir, 'screen.bundle.yaml');
    const backendPath = path.join(tmpDir, 'api', '01', '01-backend-spec.yaml');
    fs.mkdirSync(path.dirname(backendPath), { recursive: true });
    fs.writeFileSync(
      bundlePath,
      `
design:
  actions:
    - id: btn_save
      executionContract:
        apiRef: records.create
`,
      'utf8',
    );
    fs.writeFileSync(
      backendPath,
      `
endpoints:
  - id: records.create
    method: POST
    path: /api/v1/records
    action: records.create
`,
      'utf8',
    );
    try {
      const output = execSync(
        `node "${auditFeBePath}" "${bundlePath}" --backend-spec "${backendPath}"`,
        { encoding: 'utf8' },
      );
      const report = JSON.parse(output);
      assert.equal(report.totalGaps, 0);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  await t.test('audit-scenario-coverage.mjs - screens vs TC files', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'flowgrid-test-sc-'));
    const scPath = path.join(tmpDir, 'SC-01.md');
    const casesDir = path.join(tmpDir, 'cases', 'auth');
    fs.mkdirSync(casesDir, { recursive: true });
    fs.writeFileSync(
      scPath,
      `---
id: SC-01
screens:
  - W-AD-AUTH-001
  - W-AD-MISSING-002
---
# Scenario
`,
      'utf8',
    );
    fs.writeFileSync(
      path.join(casesDir, 'TC-auth-001.yaml'),
      'refs:\n  screen: W-AD-AUTH-001\n',
      'utf8',
    );
    try {
      const output = execSync(
        `node "${auditScenarioPath}" "${scPath}" --tests-root "${tmpDir}"`,
        { encoding: 'utf8' },
      );
      const report = JSON.parse(output);
      assert.ok(report.gaps.some((g) => g.code === 'SC_SCREEN_NO_TC' && g.path.includes('W-AD-MISSING-002')));
      assert.equal(report.coveredScreens.length, 1);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  // -------------------------------------------------------------------------
  // 4. AUDIT-LEGACY-GAPS TESTS
  // -------------------------------------------------------------------------
  await t.test('audit-legacy-gaps.mjs - Critical Missing Inventory & Target ID Mapping', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'flowgrid-test-legacy-'));
    const mockInventoryPath = path.join(tmpDir, 'adoption-inventory.md');

    try {
      // 1. Missing inventory file
      const outputMissing = execSync(`node "${auditLegacyPath}" W-AD-AUTH-001`, {
        cwd: tmpDir,
        encoding: 'utf8'
      });
      const reportMissing = JSON.parse(outputMissing);
      assert.ok(reportMissing.gaps.some(g => g.code === 'MISSING_ADOPTION_INVENTORY'));

      // 2. Unmapped target ID
      fs.writeFileSync(mockInventoryPath, '# Adoption Inventory\n- W-AD-OTHER-001 -> path/to/file.tsx\n');
      const outputUnmapped = execSync(`node "${auditLegacyPath}" W-AD-AUTH-001`, {
        cwd: tmpDir,
        encoding: 'utf8'
      });
      const reportUnmapped = JSON.parse(outputUnmapped);
      assert.ok(reportUnmapped.gaps.some(g => g.code === 'UNMAPPED_LEGACY_ID'));

      // 3. Mapped target ID (Success)
      fs.writeFileSync(mockInventoryPath, '# Adoption Inventory\n- W-AD-AUTH-001 -> path/to/file.tsx\n');
      const outputMapped = execSync(`node "${auditLegacyPath}" W-AD-AUTH-001`, {
        cwd: tmpDir,
        encoding: 'utf8'
      });
      const reportMapped = JSON.parse(outputMapped);
      assert.equal(reportMapped.totalGaps, 0);

    } finally {
      if (fs.existsSync(tmpDir)) {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    }
  });

  // -------------------------------------------------------------------------
  // 5. AUDIT-FLOW-GAPS TESTS
  // -------------------------------------------------------------------------
  await t.test('audit-flow-gaps.mjs - Business Process 6-Section & System Story Checks', () => {
    const incompleteFlowContent = `
# FLOW-checkout: Payment & Checkout Flow

User Story: As a customer, I want to checkout.
Background worker processes queue events in background.
`;
    withTempFile('flow-gaps', 'md', incompleteFlowContent, (filePath) => {
      const output = execSync(`node "${auditFlowPath}" "${filePath}"`, { encoding: 'utf8' });
      const report = JSON.parse(output);

      assert.ok(report.gaps.some(g => g.code === 'FLOW_MISSING_ROLE_MATRIX'));
      assert.ok(report.gaps.some(g => g.code === 'FLOW_MISSING_SYSTEM_STORY'));
      assert.ok(report.gaps.some(g => g.code === 'FLOW_MISSING_BUSINESS_RULES'));
      assert.ok(report.gaps.some(g => g.code === 'FLOW_MISSING_JOURNEY'));
      assert.ok(report.gaps.some(g => g.code === 'FLOW_MISSING_TRACEABILITY'));
      assert.ok(report.gaps.some(g => g.code === 'FLOW_MISSING_SEQUENCE_DIAGRAM'));
    });
  });

});
