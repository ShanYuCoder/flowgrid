/**
 * Product surface/module path helpers.
 *
 * Canonical (FlowGrid docs hub): surfaces/<surface>/CMP-* /...
 * Legacy: surfaces/<surface>/modules/CMP-* /...
 */

import path from 'node:path'

/**
 * Infer `surface/CMP-*` label from a file under the product tree.
 * Prefers canonical layout; falls back to legacy `modules/` segment.
 */
export function inferSurfaceFromRepoPath(absPath: string, repoRoot: string): string {
  const rel = path.relative(repoRoot, absPath).split(path.sep).join('/')

  // Canonical: surfaces/<surface>/CMP-* /...
  let m = rel.match(/^surfaces\/([^/]+)\/(CMP-[^/]+)/i)
  if (m) return `${m[1]}/${m[2]}`

  // Legacy: surfaces/<surface>/modules/CMP-* /...
  m = rel.match(/^surfaces\/([^/]+)\/modules\/(CMP-[^/]+)/i)
  if (m) return `${m[1]}/${m[2]}`

  const parts = rel.split('/')
  return parts.slice(0, Math.min(3, Math.max(parts.length - 1, 0))).join('/')
}

/** True when path uses the legacy modules/CMP-* segment. */
export function isLegacyModulesCmpPath(filePath: string): boolean {
  return /(?:^|\/)surfaces\/[^/]+\/modules\/CMP-/i.test(
    filePath.split(path.sep).join('/'),
  )
}
