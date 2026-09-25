/**
 * Cross-reference a test plan YAML against a function *.bundle.yaml (authoring SSOT).
 * Heuristic fallback when traceability block is incomplete.
 */

import { parseBundleTraceability as parseBundleInventory } from '../../cases/lib/parse-bundle-traceability.mjs';

/** @param {string} bundleText */
export function parseBundleTraceability(bundleText) {
  const inv = parseBundleInventory(bundleText);
  return {
    scenarios: inv.scenarios.map((s) => s.name),
    acceptance: inv.acceptance.map((a) => a.text),
    actions: inv.actions.map((a) => a.id),
  };
}

function normalizeKey(text) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function scenarioTokens(name) {
  const n = normalizeKey(name);
  const paren = name.match(/\(([^)]+)\)/);
  const tokens = new Set();
  if (paren) {
    for (const part of paren[1].split(/[/,&]/)) {
      const t = normalizeKey(part);
      if (t.length >= 4) tokens.add(t);
    }
  }
  for (const part of n.split(/\s+/)) {
    if (part.length >= 5) tokens.add(part);
  }
  if (n.length >= 8) tokens.add(n.slice(0, 40));
  return [...tokens];
}

function tcReferencesScenario(tcText, scenarioName) {
  const normName = normalizeKey(scenarioName);
  if (tcText.includes(scenarioName)) return true;
  if (/scenarioRef:\s*/.test(tcText) && normName.length >= 6) {
    const ref = tcText.match(/scenarioRef:\s*["']?([^"'\n]+)["']?/);
    if (ref && normalizeKey(ref[1]).includes(normName.slice(0, 20))) return true;
  }
  const tokens = scenarioTokens(scenarioName);
  return tokens.some((t) => t.length >= 5 && tcText.toLowerCase().includes(t));
}

function tcCoversAcceptance(tcText, acLine) {
  const key = normalizeKey(acLine).slice(0, 48);
  if (key.length < 8) return true;
  if (tcText.toLowerCase().includes(key.slice(0, 24))) return true;
  if (/verifiesAcceptance:/.test(tcText)) {
    const block = tcText.slice(tcText.indexOf('verifiesAcceptance:'));
    if (block.toLowerCase().includes(key.slice(0, 20))) return true;
  }
  return false;
}

function tcCoversAction(tcText, actionId, bundleText) {
  if (tcText.includes(actionId)) return true;
  if (/actionRef:\s*/.test(tcText) && tcText.includes(actionId.replace('btn_', ''))) return true;
  const actionChunk = bundleText.match(
    new RegExp(`id:\\s*${actionId}[\\s\\S]*?outcomes:`),
  );
  if (!actionChunk) return tcText.includes('success') || tcText.includes('Happy');
  const chunk = actionChunk[0];
  if (chunk.includes('onSuccess') && (tcText.includes('success') || tcText.includes('Happy Path'))) {
    return true;
  }
  if (chunk.includes('409') && (tcText.includes('409') || tcText.includes('conflict'))) return true;
  if (chunk.includes('422') && (tcText.includes('422') || tcText.includes('validation'))) return true;
  if (chunk.includes('403') && (tcText.includes('403') || tcText.includes('permission'))) return true;
  return false;
}

/**
 * @param {string} bundleText
 * @param {string} tcText
 * @param {string} [bundlePath]
 */
export function auditTestcaseBundleCross(bundleText, tcText, bundlePath = '') {
  const gaps = [];
  const { scenarios, acceptance, actions } = parseBundleTraceability(bundleText);

  function addGap(code, severity, fieldPath, message, suggestedFix) {
    gaps.push({ code, severity, path: fieldPath, message, suggestedFix, category: 'bundle-cross' });
  }

  if (scenarios.length === 0 && acceptance.length === 0) {
    addGap(
      'TC_BUNDLE_EMPTY_TRACE',
      'warning',
      'bundle.userStories',
      'Bundle has no scenarios or acceptanceCriteria to cross-check.',
      'Complete bundle userStories on docs hub before testcase cross-audit.',
    );
    return { bundle: bundlePath, bundleCrossGaps: gaps };
  }

  for (const name of scenarios) {
    if (!tcReferencesScenario(tcText, name)) {
      addGap(
        'TC_BUNDLE_SCENARIO_UNCOVERED',
        'warning',
        `userStories.scenarios.${name}`,
        `No testcase references scenario "${name}".`,
        'Add testcase with scenarioRef or title/steps mentioning this scenario (or parent SC E2E).',
      );
    }
  }

  for (const ac of acceptance) {
    if (!tcCoversAcceptance(tcText, ac)) {
      addGap(
        'TC_BUNDLE_AC_UNCOVERED',
        'info',
        'acceptanceCriteria',
        `Acceptance line not reflected in test plan: "${ac.length > 80 ? `${ac.slice(0, 80)}…` : ac}"`,
        'Add verifiesAcceptance[] entry or testcase steps/assertions mapping to this AC line.',
      );
    }
  }

  for (const actionId of actions) {
    const hasOutcomes = bundleText.includes(`id: ${actionId}`) && bundleText.includes('outcomes:');
    if (!hasOutcomes) continue;
    if (!tcCoversAction(tcText, actionId, bundleText)) {
      addGap(
        'TC_BUNDLE_ACTION_UNCOVERED',
        'info',
        `design.actions.${actionId}`,
        `Design action "${actionId}" with outcomes matrix has no explicit testcase trace.`,
        `Reference actionRef: ${actionId} or cover happy/422/409/403 paths in test matrix.`,
      );
    }
  }

  return { bundle: bundlePath, bundleCrossGaps: gaps };
}
