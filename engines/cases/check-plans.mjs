#!/usr/bin/env node
/**
 * Validate TC-*.yaml against schemas/testcase.schema.json (package SSOT).
 * Usage: pnpm check:plans  |  flowgrid cases:check
 */
import path from 'node:path'
import { listCaseYamlUnderProject } from './lib/list-case-yaml.mjs'
import { validateTcFile } from './lib/validate-tc-schema.mjs'

const root = process.cwd()

async function main() {
  const files = await listCaseYamlUnderProject(root)
  const errors = []
  for (const file of files) {
    const result = await validateTcFile(file, root)
    if (!result.ok) errors.push(...result.errors)
  }
  if (errors.length) {
    console.error('check:plans FAILED')
    for (const e of errors) console.error(`  - ${e}`)
    process.exit(1)
  }
  console.log(`check:plans OK (${files.length} case(s))`)
}

main().catch((e) => {
  console.error('check:plans FAILED')
  console.error(`  - ${e.message}`)
  process.exit(1)
})
