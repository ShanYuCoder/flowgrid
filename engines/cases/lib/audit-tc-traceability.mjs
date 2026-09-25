import { parseBundleTraceability } from './parse-bundle-traceability.mjs'

/**
 * Structured bundle ↔ TC traceability (schema traceability block).
 * @param {Record<string, unknown>} tc — parsed TC YAML
 * @param {string} bundleText
 * @param {{ strict?: boolean; bundlePath?: string }} [opts]
 */
export function auditTcTraceability(tc, bundleText, opts = {}) {
  const strict = Boolean(opts.strict)
  const gaps = []
  const bundle = parseBundleTraceability(bundleText)
  const trace = tc.traceability && typeof tc.traceability === 'object' ? tc.traceability : {}
  const screen = tc.refs?.screen

  function add(code, severity, fieldPath, message, suggestedFix) {
    gaps.push({
      code,
      severity,
      path: fieldPath,
      message,
      suggestedFix,
      category: 'traceability',
    })
  }

  if (bundle.screenId && screen && bundle.screenId !== screen) {
    add(
      'TC_TRACE_SCREEN_MISMATCH',
      'warning',
      'traceability.bundleScreen',
      `Bundle page-id ${bundle.screenId} differs from refs.screen ${screen}.`,
      'Align bundle page-id with TC refs.screen or fix route.',
    )
  }

  if (trace.bundleScreen && screen && trace.bundleScreen !== screen) {
    add(
      'TC_TRACE_BUNDLE_SCREEN_FIELD',
      'critical',
      'traceability.bundleScreen',
      `traceability.bundleScreen must match refs.screen (${screen}).`,
      `Set traceability.bundleScreen: ${screen}`,
    )
  }

  const declaredScenarios = new Set(
    (Array.isArray(trace.bundleScenarios) ? trace.bundleScenarios : []).map(String),
  )
  const declaredAc = new Set(
    (Array.isArray(trace.acceptanceRefs) ? trace.acceptanceRefs : []).map(String),
  )
  const declaredActions = new Set(
    (Array.isArray(trace.actionRefs) ? trace.actionRefs : []).map(String),
  )

  for (const { name, slug } of bundle.scenarios) {
    const covered =
      declaredScenarios.has(slug) ||
      declaredScenarios.has(name) ||
      (!strict && tcCoversScenarioLoose(tc, name))
    if (!covered) {
      add(
        'TC_TRACE_SCENARIO_MISSING',
        strict ? 'critical' : 'warning',
        `traceability.bundleScenarios.${slug}`,
        `Bundle scenario not traced: "${name}" (slug: ${slug}).`,
        `Add "${slug}" to traceability.bundleScenarios[] (or full scenario name).`,
      )
    }
  }

  for (const { id, text } of bundle.acceptance) {
    if (!declaredAc.has(id) && !(declaredAc.has(text) && text.length < 120)) {
      const loose = !strict && String(tc.story || tc.summary || '').includes(text.slice(0, 24))
      if (!loose) {
        add(
          'TC_TRACE_AC_MISSING',
          strict ? 'critical' : 'info',
          `traceability.acceptanceRefs.${id}`,
          `Bundle acceptance ${id} not in traceability.acceptanceRefs.`,
          `Add ${id} to traceability.acceptanceRefs[] (bundle line: "${text.slice(0, 60)}…").`,
        )
      }
    }
  }

  for (const { id, hasOutcomes } of bundle.actions) {
    if (!hasOutcomes) continue
    const inMatrix = matrixMentionsAction(tc, id)
    if (!declaredActions.has(id) && !inMatrix && strict) {
      add(
        'TC_TRACE_ACTION_MISSING',
        'critical',
        `traceability.actionRefs.${id}`,
        `Design action ${id} with outcomes not listed in traceability.actionRefs.`,
        `Add ${id} to traceability.actionRefs[] and cover in testMatrix.`,
      )
    } else if (!declaredActions.has(id) && !inMatrix && !strict) {
      add(
        'TC_TRACE_ACTION_MISSING',
        'info',
        `traceability.actionRefs.${id}`,
        `Design action ${id} not explicitly traced.`,
        `Add ${id} to traceability.actionRefs[].`,
      )
    }
  }

  if (strict && bundle.scenarios.length && !trace.bundleScenarios) {
    add(
      'TC_TRACE_BLOCK_REQUIRED',
      'critical',
      'traceability',
      'strict gate requires traceability.bundleScenarios when bundle has userStories.scenarios.',
      'Add traceability: { bundleScreen, bundleScenarios, acceptanceRefs, actionRefs }.',
    )
  }

  return {
    bundle: opts.bundlePath ?? null,
    expected: {
      scenarios: bundle.scenarios.map((s) => s.slug),
      acceptance: bundle.acceptance.map((a) => a.id),
      actions: bundle.actions.filter((a) => a.hasOutcomes).map((a) => a.id),
    },
    gaps,
  }
}

function tcCoversScenarioLoose(tc, name) {
  const blob = JSON.stringify(tc)
  return blob.includes(name) || blob.toLowerCase().includes(name.slice(0, 20).toLowerCase())
}

function matrixMentionsAction(tc, actionId) {
  const blob = JSON.stringify(tc.testMatrix ?? [])
  return blob.includes(actionId) || blob.includes(actionId.replace('btn_', ''))
}
