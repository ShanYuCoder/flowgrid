/**
 * Audit a single cases/TC-*.yaml file (schemaVersion 2 shape).
 */

import path from 'path';
import { TEST_MATRIX_FACETS } from './testcase-matrix-facets.mjs';

export function isTestCaseArtifact(filePath, rawText) {
  const base = path.basename(filePath);
  if (/^TC-.*\.ya?ml$/i.test(base)) return true;
  if (/^id:\s*TC-[A-Z0-9-]+/m.test(rawText) && rawText.includes('testMatrix:')) return true;
  return false;
}

function extractTestMatrixFacets(rawText) {
  const facets = new Set();
  const idx = rawText.indexOf('testMatrix:');
  if (idx === -1) return facets;
  const tail = rawText.slice(idx);
  const end = tail.search(/\n[a-zA-Z][\w]*:\s*(\n|\S)/);
  const block = end > 0 ? tail.slice(0, end) : tail.slice(0, 8000);
  for (const m of block.matchAll(/facet:\s*["']?([\w_]+)["']?/g)) {
    facets.add(m[1]);
  }
  return facets;
}

function hasNonEmptySteps(rawText) {
  if (!rawText.includes('steps:')) return false;
  const m = rawText.match(/steps:\s*\n((?:[ \t]+-\s+.+\n?)+)/);
  if (!m) return false;
  return m[1].split('\n').some((line) => /^\s+-\s+\S/.test(line));
}

function readSchemaVersion(rawText) {
  const m = rawText.match(/^schemaVersion:\s*(\d+)/m);
  return m ? Number(m[1]) : null;
}

export function auditTestcaseTcFile(rawText, filePath) {
  const gaps = [];

  function addGap(code, severity, fieldPath, message, suggestedFix, extra = {}) {
    gaps.push({
      code,
      severity,
      path: fieldPath,
      message,
      suggestedFix,
      category: 'tc-file',
      ...extra,
    });
  }

  const schemaVersion = readSchemaVersion(rawText);
  if (schemaVersion !== 2) {
    addGap(
      'TC_SCHEMA_NOT_V2',
      'critical',
      'schemaVersion',
      'TC file must declare schemaVersion: 2 for release gate compatibility.',
      'Add schemaVersion: 2 at top of file and complete testMatrix facets.',
    );
  }

  if (!/^id:\s*TC-[A-Z0-9-]+/m.test(rawText)) {
    addGap(
      'TC_MISSING_ID',
      'critical',
      'id',
      'Missing or invalid id (expected pattern TC-…).',
      'Set id: TC-<FEATURE>-<NN> at document root.',
    );
  }

  if (!/refs:\s*\n[\s\S]*?screen:\s*(W|API|UI)-/m.test(rawText)) {
    addGap(
      'TC_MISSING_REFS_SCREEN',
      'critical',
      'refs.screen',
      'Missing refs.screen (W-* / API-* / UI-*).',
      'Declare refs.screen matching docs hub page-id.',
    );
  }

  if (!rawText.includes('testMatrix:')) {
    addGap(
      'TC_MISSING_TEST_MATRIX',
      'critical',
      'testMatrix',
      'Missing testMatrix array (required for schemaVersion 2).',
      'Add testMatrix[] rows with facet, description, input, expected per /testcase skill.',
    );
  } else {
    const facets = extractTestMatrixFacets(rawText);
    for (const required of TEST_MATRIX_FACETS) {
      if (!facets.has(required)) {
        addGap(
          'TC_MATRIX_MISSING_FACET',
          'critical',
          `testMatrix.facet.${required}`,
          `testMatrix missing required facet "${required}".`,
          `Add a testMatrix row with facet: ${required}.`,
        );
      }
    }
    const unknown = [...facets].filter((f) => !TEST_MATRIX_FACETS.includes(f));
    for (const bad of unknown) {
      addGap(
        'TC_MATRIX_UNKNOWN_FACET',
        'warning',
        `testMatrix.facet.${bad}`,
        `Unknown testMatrix facet "${bad}".`,
        `Use one of: ${TEST_MATRIX_FACETS.join(', ')}.`,
      );
    }
  }

  if (!hasNonEmptySteps(rawText)) {
    addGap(
      'TC_MISSING_STEPS',
      'critical',
      'steps',
      'Missing non-empty steps[] (min 1 step).',
      'Add steps[] with executable UI actions for E2E gen.',
    );
  }

  if (!rawText.includes('testIds:') || !/testIds:[\s\S]*required:/m.test(rawText)) {
    addGap(
      'TC_MISSING_TEST_IDS',
      'warning',
      'testIds.required',
      'Missing testIds.required[] for Playwright selectors.',
      'Mirror design testId / data-testid inventory from bundle ir/design.',
    );
  }

  const facets = extractTestMatrixFacets(rawText);
  if (facets.has('negative_duplicate') && !rawText.includes('409') && !/status:\s*409/.test(rawText)) {
    addGap(
      'TC_MATRIX_409_ASSERTION',
      'warning',
      'testMatrix.negative_duplicate',
      'negative_duplicate row should assert HTTP 409 or conflict outcome.',
      'Set expected.status: 409 or explicit conflict message in matrix expected block.',
    );
  }

  if (
    !rawText.includes('story:') &&
    !rawText.includes('summary:') &&
    !rawText.match(/description:\s*["'].{20,}/)
  ) {
    addGap(
      'TC_THIN_BUSINESS_STORY',
      'warning',
      'story',
      'Missing rich story/summary for business context.',
      'Add multi-line story: or summary: per /testcase skill.',
    );
  }

  return {
    file: filePath,
    artifactKind: 'tc-file',
    schemaVersion,
    matrixFacets: [...extractTestMatrixFacets(rawText)],
    totalGaps: gaps.length,
    criticalGaps: gaps.filter((g) => g.severity === 'critical').length,
    warningGaps: gaps.filter((g) => g.severity === 'warning').length,
    infoGaps: gaps.filter((g) => g.severity === 'info').length,
    gaps,
  };
}

export function auditTestcaseTcFileFromPath(filePath, rawText) {
  if (!isTestCaseArtifact(filePath, rawText)) {
    return null;
  }
  return auditTestcaseTcFile(rawText, filePath);
}
