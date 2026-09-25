import { readdir } from 'node:fs/promises'
import path from 'node:path'

export async function listCaseYaml(dir) {
  const out = []
  for (const entry of await listEntries(dir)) {
    const p = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      out.push(...(await listCaseYaml(p)))
      continue
    }
    if (entry.isFile() && /^TC-.*\.ya?ml$/i.test(entry.name)) out.push(p)
  }
  return out.sort()
}

async function listEntries(dir) {
  try {
    return await readdir(dir, { withFileTypes: true })
  } catch {
    return []
  }
}

export async function listCaseYamlUnderProject(projectRoot) {
  return listCaseYaml(path.join(projectRoot, 'cases'))
}
