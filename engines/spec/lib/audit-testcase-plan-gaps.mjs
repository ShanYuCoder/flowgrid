/**
 * Legacy multi-case test **plan** files (*.test.yaml, qa-item.yaml with testcases:).
 * Prefer cases/TC-*.yaml — see audit-testcase-tc.mjs.
 */

export function auditTestcasePlanContent(rawText, filePath) {
  const gaps = [];

  function addGap(code, severity, fieldPath, message, suggestedFix, extra = {}) {
    gaps.push({
      code,
      severity,
      path: fieldPath,
      message,
      suggestedFix,
      category: 'plan',
      ...extra,
    });
  }

  if (!rawText.includes('testcases:') && !rawText.includes('cases:') && !rawText.includes('scenarios:')) {
    addGap(
      'TC_MISSING_CASES_LIST',
      'critical',
      'testcases',
      'Missing testcases array in plan file.',
      'Declare testcases[] array with id, title, scenarioRef, steps, and expectedResult — or author cases/**/TC-*.yaml instead.',
    );
  }

  addGap(
    'TC_LEGACY_PLAN_FORMAT',
    'info',
    'artifact',
    'Plan-style test YAML is legacy; new work must use cases/**/TC-*.yaml (schemaVersion: 2).',
    'Split into per-screen TC-*.yaml files and run flowgrid cases:check.',
  );

  if (!rawText.includes('Initial Load') && !rawText.includes('init') && !rawText.includes('initial')) {
    addGap(
      'TC_MISSING_INITIAL_LOAD',
      'warning',
      'testcases.initial_load',
      'Missing testcase for Initial Load & Data Hydration scenario.',
      'Add testcase verifying initial page fetch, role permission check, skeleton/empty states.',
    );
  }

  if (!rawText.includes('Validation') && !rawText.includes('invalid') && !rawText.includes('validation')) {
    addGap(
      'TC_MISSING_VALIDATION_CASE',
      'warning',
      'testcases.validation',
      'Missing testcase for Input & Inline Validation scenarios.',
      'Add testcase verifying invalid field formats, required field omissions, and boundary errors.',
    );
  }

  if (!rawText.includes('Happy Path') && !rawText.includes('success') && !rawText.includes('successful')) {
    addGap(
      'TC_MISSING_HAPPY_PATH',
      'warning',
      'testcases.happy_path',
      'Missing testcase for Successful Submission (Happy Path).',
      'Add testcase verifying valid form submission, button locking against double-submit, and redirect.',
    );
  }

  if (!rawText.includes('409') && !rawText.includes('500') && !rawText.includes('exception') && !rawText.includes('error')) {
    addGap(
      'TC_MISSING_EXCEPTION_CASE',
      'warning',
      'testcases.exceptions',
      'Missing testcase for Exception Handling (409 Conflict, 5xx Server Error, Timeout).',
      'Add testcase verifying network failure handling, session expiration, and form state draft preservation.',
    );
  }

  if (!rawText.includes('boundary') && !rawText.includes('Boundary') && !rawText.includes('min') && !rawText.includes('max')) {
    addGap(
      'TC_MISSING_BOUNDARY_MATRIX',
      'warning',
      'testcases.boundary',
      'Missing Boundary Value Analysis test matrix (min-1, min, normal, max, max+1).',
      'Add testcase checking boundary limits for numeric/text input fields.',
    );
  }

  if (!rawText.includes('double') && !rawText.includes('concurrency') && !rawText.includes('lock')) {
    addGap(
      'TC_MISSING_DOUBLE_SUBMIT',
      'warning',
      'testcases.concurrency',
      'Missing testcase for Double Submit prevention and Concurrency control.',
      'Add testcase checking submit button disabling upon click and optimistic locking conflict handling.',
    );
  }

  if (!rawText.includes('RBAC') && !rawText.includes('permission') && !rawText.includes('role')) {
    addGap(
      'TC_MISSING_RBAC_CASE',
      'warning',
      'testcases.rbac',
      'Missing testcase for Access Control & Role-Based Access (RBAC).',
      'Add testcase verifying role-specific UI visibility and unauthorized action blocking.',
    );
  }

  if (!rawText.includes('empty') && !rawText.includes('Empty') && !rawText.includes('no data')) {
    addGap(
      'TC_MISSING_EMPTY_STATE',
      'info',
      'testcases.empty_state',
      'Missing testcase for Empty State handling (empty data table, empty list).',
      'Add testcase verifying UI rendering when no records are returned.',
    );
  }

  return finalizeReport(gaps, filePath);
}

function finalizeReport(gaps, filePath) {
  return {
    file: filePath,
    totalGaps: gaps.length,
    criticalGaps: gaps.filter((g) => g.severity === 'critical').length,
    warningGaps: gaps.filter((g) => g.severity === 'warning').length,
    infoGaps: gaps.filter((g) => g.severity === 'info').length,
    gaps,
  };
}
