import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Ajv2020 from 'ajv/dist/2020.js'
import { parse } from 'yaml'

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')

export function resolveSchemaPath() {
  if (process.env.FLOWGRID_TESTCASE_SCHEMA) {
    return path.resolve(process.env.FLOWGRID_TESTCASE_SCHEMA)
  }
  return path.join(packageRoot, 'schemas', 'testcase.schema.json')
}

let compiled

async function getValidator() {
  if (!compiled) {
    const schema = JSON.parse(await readFile(resolveSchemaPath(), 'utf8'))
    compiled = new Ajv2020({ allErrors: true }).compile(schema)
  }
  return compiled
}

export function formatValidationError(rel, error) {
  const location = error.instancePath
    .split('/')
    .filter(Boolean)
    .map((part) => part.replaceAll('~1', '/').replaceAll('~0', '~'))
    .join('.')
  if (error.keyword === 'required') {
    const field = [location, error.params.missingProperty].filter(Boolean).join('.')
    return `${rel}: ${field} required`
  }
  return `${rel}${location ? `: ${location}` : ''}: ${error.message}`
}

/**
 * @param {string} filePath absolute
 * @param {string} projectRoot
 */
export async function validateTcFile(filePath, projectRoot) {
  const rel = path.relative(projectRoot, filePath)
  const validate = await getValidator()
  let data
  try {
    data = parse(await readFile(filePath, 'utf8'))
  } catch (e) {
    return { ok: false, rel, data: null, errors: [`${rel}: YAML parse — ${e.message}`] }
  }
  if (!validate(data)) {
    return {
      ok: false,
      rel,
      data,
      errors: (validate.errors ?? []).map((err) => formatValidationError(rel, err)),
    }
  }
  return { ok: true, rel, data, errors: [] }
}
