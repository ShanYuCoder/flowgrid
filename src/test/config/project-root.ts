import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const pkgRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

export type FlowGridTestLane = 'tests' | 'fe'

function envFirst(...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = process.env[key]
    if (value) return value
  }
  return undefined
}

export function packageRoot(): string {
  return pkgRoot
}

export function packageVersion(): string {
  return (JSON.parse(readFileSync(path.join(pkgRoot, 'package.json'), 'utf8')) as { version?: string })
    .version ?? '0.0.0'
}

export function resolveProjectRoot(explicit?: string): string {
  const root = path.resolve(
    explicit ?? envFirst('FLOWGRID_PROJECT_ROOT') ?? process.cwd(),
  )
  if (!existsSync(root)) throw new Error(`FlowGrid test project root not found: ${root}`)
  return root
}

export function enginePath(...parts: string[]): string {
  return path.join(pkgRoot, 'engines', ...parts)
}
