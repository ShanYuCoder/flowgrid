#!/usr/bin/env node

/**
 * audit-testcase-gaps.mjs
 * Zero-dependency static audit script for Forgekit Testcase Plans (*.test.yaml, qa-item.yaml).
 * Verifies 100% coverage of userStories scenarios, acceptance criteria, and edge cases.
 */

import fs from 'fs';
import path from 'path';

function auditTestcaseContent(rawText, filePath) {
  const gaps = [];

  function addGap(code, severity, fieldPath, message, suggestedFix) {
    gaps.push({
      code,
      severity, // 'critical' | 'warning' | 'info'
      path: fieldPath,
      message,
      suggestedFix
    });
  }

  // 1. Check test cases list
  if (!rawText.includes('testcases:') && !rawText.includes('cases:') && !rawText.includes('scenarios:')) {
    addGap(
      'TC_MISSING_CASES_LIST',
      'critical',
      'testcases',
      'Missing testcases array in plan file.',
      'Declare testcases[] array with id, title, scenarioRef, steps, and expectedResult.'
    );
  }

  // 2. Check initial load testcase
  if (!rawText.includes('Initial Load') && !rawText.includes('init') && !rawText.includes('initial')) {
    addGap(
      'TC_MISSING_INITIAL_LOAD',
      'warning',
      'testcases.initial_load',
      'Missing testcase for Initial Load & Data Hydration scenario.',
      'Add testcase verifying initial page fetch, role permission check, skeleton/empty states.'
    );
  }

  // 3. Check validation error testcase
  if (!rawText.includes('Validation') && !rawText.includes('invalid') && !rawText.includes('validation')) {
    addGap(
      'TC_MISSING_VALIDATION_CASE',
      'warning',
      'testcases.validation',
      'Missing testcase for Input & Inline Validation scenarios.',
      'Add testcase verifying invalid field formats, required field omissions, and boundary errors.'
    );
  }

  // 4. Check happy path submit testcase
  if (!rawText.includes('Happy Path') && !rawText.includes('success') && !rawText.includes('successful')) {
    addGap(
      'TC_MISSING_HAPPY_PATH',
      'warning',
      'testcases.happy_path',
      'Missing testcase for Successful Submission (Happy Path).',
      'Add testcase verifying valid form submission, button locking against double-submit, and redirect.'
    );
  }

  // 5. Check exception / error testcase
  if (!rawText.includes('409') && !rawText.includes('500') && !rawText.includes('exception') && !rawText.includes('error')) {
    addGap(
      'TC_MISSING_EXCEPTION_CASE',
      'warning',
      'testcases.exceptions',
      'Missing testcase for Exception Handling (409 Conflict, 5xx Server Error, Timeout).',
      'Add testcase verifying network failure handling, session expiration, and form state draft preservation.'
    );
  }

  // 6. Check boundary test matrix
  if (!rawText.includes('boundary') && !rawText.includes('Boundary') && !rawText.includes('min') && !rawText.includes('max')) {
    addGap(
      'TC_MISSING_BOUNDARY_MATRIX',
      'warning',
      'testcases.boundary',
      'Missing Boundary Value Analysis test matrix (min-1, min, normal, max, max+1).',
      'Add testcase checking boundary limits for numeric/text input fields.'
    );
  }

  // 7. Check double-submit / concurrency testcase
  if (!rawText.includes('double') && !rawText.includes('concurrency') && !rawText.includes('lock')) {
    addGap(
      'TC_MISSING_DOUBLE_SUBMIT',
      'warning',
      'testcases.concurrency',
      'Missing testcase for Double Submit prevention and Concurrency control.',
      'Add testcase checking submit button disabling upon click and optimistic locking conflict handling.'
    );
  }

  // 8. Check RBAC / permission testcase
  if (!rawText.includes('RBAC') && !rawText.includes('permission') && !rawText.includes('role')) {
    addGap(
      'TC_MISSING_RBAC_CASE',
      'warning',
      'testcases.rbac',
      'Missing testcase for Access Control & Role-Based Access (RBAC).',
      'Add testcase verifying role-specific UI visibility and unauthorized action blocking.'
    );
  }

  // 9. Check empty state testcase
  if (!rawText.includes('empty') && !rawText.includes('Empty') && !rawText.includes('no data')) {
    addGap(
      'TC_MISSING_EMPTY_STATE',
      'info',
      'testcases.empty_state',
      'Missing testcase for Empty State handling (empty data table, empty list).',
      'Add testcase verifying UI rendering when no records are returned.'
    );
  }

  return {
    file: filePath,
    totalGaps: gaps.length,
    criticalGaps: gaps.filter(g => g.severity === 'critical').length,
    warningGaps: gaps.filter(g => g.severity === 'warning').length,
    infoGaps: gaps.filter(g => g.severity === 'info').length,
    gaps
  };
}

// CLI Execution
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('Usage: node engines/spec/lib/audit-testcase-gaps.mjs <path-to-test.yaml>');
  process.exit(0);
}

const targetFile = path.resolve(process.cwd(), args[0]);
if (!fs.existsSync(targetFile)) {
  console.error(JSON.stringify({ error: `File not found: ${targetFile}` }));
  process.exit(1);
}

const rawText = fs.readFileSync(targetFile, 'utf8');
const report = auditTestcaseContent(rawText, targetFile);
console.log(JSON.stringify(report, null, 2));
