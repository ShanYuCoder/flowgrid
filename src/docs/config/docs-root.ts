/**
 * Resolve docs hub root (any arc42 × C4 MD tree with architecture/).
 *
 * Order: explicit tool argument → FLOWGRID_DOCS_ROOT → cwd (if hub) → error.
 * The package never remembers or searches for a target repository.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const pkgRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')

export function packageRoot(): string {
  return pkgRoot
}

export function looksLikeHub(abs: string): boolean {
  try {
    if (fs.statSync(path.join(abs, 'architecture')).isDirectory()) return true
  } catch {}
  try {
    if (fs.statSync(path.join(abs, 'architecture')).isDirectory()) return true
  } catch {}
  return false
}

/**
 * Best-effort root for local wiring. Empty when no project root is available.
 */
export function defaultDocsRoot(): string {
  const fromEnv = process.env.FLOWGRID_DOCS_ROOT
  if (fromEnv) return path.resolve(fromEnv)
  if (looksLikeHub(process.cwd())) return process.cwd()
  return ''
}

export function resolveDocsRoot(explicit?: string): string {
  if (explicit) {
    const abs = path.resolve(explicit)
    if (!fs.existsSync(abs)) throw new Error(`docsRoot not found: ${abs}`)
    if (!looksLikeHub(abs)) {
      throw new Error(`docsRoot missing architecture/: ${abs}`)
    }
    return abs
  }
  const envRoot = process.env.FLOWGRID_DOCS_ROOT
  if (envRoot) {
    const abs = path.resolve(envRoot)
    if (!fs.existsSync(abs)) throw new Error(`FLOWGRID_DOCS_ROOT not found: ${abs}`)
    if (!looksLikeHub(abs)) {
      throw new Error(`FLOWGRID_DOCS_ROOT missing architecture/: ${abs}`)
    }
    return abs
  }
  if (looksLikeHub(process.cwd())) return process.cwd()
  throw new Error(
    'Cannot resolve docs root. Pass docsRoot to the tool, set FLOWGRID_DOCS_ROOT in MCP env, ' +
      'or cd into a docs hub (must contain architecture/). Setup: flowgrid init',
  )
}

export function enginesRoot(): string {
  return path.join(packageRoot(), 'engines')
}
