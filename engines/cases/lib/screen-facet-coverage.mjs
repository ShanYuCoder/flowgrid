import { TEST_MATRIX_FACETS } from '../../spec/lib/testcase-matrix-facets.mjs'

/**
 * Per-screen union of testMatrix facets across multiple TC files.
 * @param {Array<{ file: string; data: Record<string, unknown> }>} tcFiles
 */
export function auditScreenFacetCoverage(tcFiles, opts = {}) {
  const strict = Boolean(opts.strict)
  const byScreen = new Map()

  for (const { file, data } of tcFiles) {
    const screen = data.refs?.screen
    if (!screen || typeof screen !== 'string') continue
    if (!byScreen.has(screen)) byScreen.set(screen, { files: [], facets: new Set() })
    const bucket = byScreen.get(screen)
    bucket.files.push(file)
    const matrix = Array.isArray(data.testMatrix) ? data.testMatrix : []
    for (const row of matrix) {
      if (row?.facet) bucket.facets.add(String(row.facet))
    }
  }

  const gaps = []
  for (const [screen, { files, facets }] of byScreen) {
    for (const required of TEST_MATRIX_FACETS) {
      if (!facets.has(required)) {
        gaps.push({
          code: 'TC_SCREEN_FACET_GAP',
          severity: strict ? 'critical' : 'warning',
          path: `screen.${screen}.facets.${required}`,
          message: `Screen ${screen} missing testMatrix facet "${required}" across ${files.length} TC file(s).`,
          suggestedFix: `Add a TC-* row with facet: ${required} or split matrix across files on same refs.screen.`,
          category: 'screen-facets',
          screen,
          files,
        })
      }
    }
  }

  return { gaps, screens: [...byScreen.keys()] }
}
