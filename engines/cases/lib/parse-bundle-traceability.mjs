/**
 * Parse bundle YAML text into traceability inventory (light parse).
 */

export function scenarioToSlug(name) {
  const paren = name.match(/\(([^)]+)\)/)
  if (paren) {
    const part = paren[1].split(/[/,&]/)[0].trim()
    return part
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s-]/gu, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 48)
  }
  return name
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .slice(0, 48)
}

export function parseBundleTraceability(bundleText) {
  const scenarios = []
  const scenarioBlock = bundleText.match(
    /scenarios:\s*([\s\S]*?)(?:\n\s{2}\w|\nacceptanceCriteria:|\n\w[\w-]*:)/,
  )
  if (scenarioBlock) {
    for (const m of scenarioBlock[1].matchAll(/-?\s*name:\s*["']?([^"'\n]+)["']?/g)) {
      const name = m[1].trim()
      if (name) {
        scenarios.push({ name, slug: scenarioToSlug(name) })
      }
    }
  }

  const acceptance = []
  const acIdx = bundleText.indexOf('acceptanceCriteria:')
  if (acIdx !== -1) {
    const tail = bundleText.slice(acIdx)
    const lines = tail.split('\n').slice(1)
    let i = 0
    for (const line of lines) {
      if (/^\S/.test(line) && !line.startsWith(' ')) break
      const item = line.match(/^\s*-\s*(.+)$/)
      if (item) {
        i += 1
        let text = item[1].replace(/^["']|["']$/g, '').trim()
        text = text.replace(/^\[\s*\]\s*/, '').trim()
        if (text) {
          acceptance.push({
            id: `AC-${String(i).padStart(2, '0')}`,
            text,
          })
        }
      }
    }
  }

  const actions = []
  const actionsIdx = bundleText.indexOf('\n  actions:')
  const searchFrom = actionsIdx !== -1 ? actionsIdx : bundleText.indexOf('actions:')
  if (searchFrom !== -1) {
    const slice = bundleText.slice(searchFrom)
    for (const m of slice.matchAll(/\n\s*-?\s*id:\s*(btn_[\w]+)/g)) {
      const id = m[1]
      const chunk = slice.match(new RegExp(`id:\\s*${id}[\\s\\S]*?(?=\\n\\s*-?\\s*id:\\s*btn_|$)`))
      const hasOutcomes = chunk && chunk[0].includes('outcomes:')
      actions.push({ id, hasOutcomes })
    }
  }

  const pageIdMatch = bundleText.match(/^page-id:\s*["']?([^"'\n]+)["']?/m)
  const screenId = pageIdMatch?.[1]?.trim()

  return { scenarios, acceptance, actions, screenId }
}
