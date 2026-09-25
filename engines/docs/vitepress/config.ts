import { withMermaid } from 'vitepress-plugin-mermaid'
import { defineConfig } from 'vitepress'
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { buildSurfacesSidebarItems, SKIP_NAV_DIRS, markdownNavText } from './surfaces-nav.mjs'

import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))


function buildRecursiveSidebar(dirPath: string, urlPrefix: string): any[] {
// ... existing buildRecursiveSidebar body ...
  if (!fs.existsSync(dirPath)) return []
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true })
    const items: any[] = []

    // Read files first (excluding index.md)
    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith('.md') && entry.name !== 'index.md') {
        const filePath = path.join(dirPath, entry.name)
        const nameWithoutExt = entry.name.replace(/\.md$/, '')
        let title = nameWithoutExt
        try {
          const content = fs.readFileSync(filePath, 'utf8')
          title = markdownNavText(entry.name, content) || content.match(/^#\s+(.+)$/m)?.[1]?.trim() || nameWithoutExt
        } catch {}
        items.push({
          text: title,
          link: `${urlPrefix}${nameWithoutExt}`
        })
      }
    }

    attachGeneratedDocs(dirPath, urlPrefix, items)

    // Read directories
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (SKIP_NAV_DIRS.has(entry.name)) continue
        const subDirPath = path.join(dirPath, entry.name)
        const indexPath = path.join(subDirPath, 'index.md')
        let title = /^db-erd$/i.test(entry.name) ? 'db-erd' : entry.name
        let link = undefined

        if (fs.existsSync(indexPath) && !/^db-erd$/i.test(entry.name)) {
          try {
            const content = fs.readFileSync(indexPath, 'utf8')
            const short = markdownNavText('index.md', content)
            const titleMatch = content.match(/^#\s+(.+)$/m)
            if (short) title = short
            else if (titleMatch) title = titleMatch[1].trim()
          } catch {}
          link = `${urlPrefix}${entry.name}/`
        } else if (fs.existsSync(indexPath)) {
          link = `${urlPrefix}${entry.name}/`
        }

        const subItems = buildRecursiveSidebar(subDirPath, `${urlPrefix}${entry.name}/`)

        const item: any = { text: title }
        if (link) item.link = link
        if (subItems.length > 0) {
          item.items = subItems
          item.collapsed = true
        }
        
        if (link || subItems.length > 0) {
          items.push(item)
        }
      }
    }

    return items
  } catch (e) {
    return []
  }
}

function mdTitleFromFile(filePath: string, fallback: string) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const titleMatch = content.match(/^#\s+(.+)$/m)
    if (titleMatch) return titleMatch[1].trim()
  } catch {}
  return fallback
}

function attachGeneratedDocs(dirPath: string, urlPrefix: string, items: any[]) {
  const spec = path.join(dirPath, 'ir', 'generated', 'spec.md')
  if (fs.existsSync(spec)) {
    items.push({
      text: mdTitleFromFile(spec, 'spec'),
      link: `${urlPrefix}ir/generated/spec`,
    })
  }
}

function getSurfacesSidebar(root: string, docsDir: string, prefix: string) {
  let surfacesDir = path.join(root, 'surfaces')
  if (!fs.existsSync(surfacesDir) && (fs.existsSync(path.join(docsDir, 'surfaces')) || fs.existsSync(path.join(root, 'surfaces')))) {
    surfacesDir = fs.existsSync(path.join(docsDir, 'surfaces')) ? path.join(docsDir, 'surfaces') : path.join(root, 'surfaces')
  }
  return buildSurfacesSidebarItems(surfacesDir, `${prefix}/`)
}

function getOverviewSidebar(root: string, docsDir: string, prefix: string) {
  let overviewDir = path.join(root, 'overview')
  if (!fs.existsSync(overviewDir) && (fs.existsSync(path.join(docsDir, 'overview')) || fs.existsSync(path.join(root, 'overview')))) {
    overviewDir = fs.existsSync(path.join(docsDir, 'overview')) ? path.join(docsDir, 'overview') : path.join(root, 'overview')
  }
  return buildRecursiveSidebar(overviewDir, `${prefix}/`)
}

function getBusinessProcessSidebarItems(root: string, prefix: string) {
  const processDir = path.join(root, prefix.replace(/^\//, ''), '03-business-process')
  if (!fs.existsSync(processDir)) return []
  try {
    const entries = fs.readdirSync(processDir, { withFileTypes: true })
    const items = []
    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith('.md')) {
        const nameWithoutExt = entry.name.replace(/\.md$/, '')
        if (nameWithoutExt === 'index') continue
        let title = nameWithoutExt
        const content = fs.readFileSync(path.join(processDir, entry.name), 'utf8')
        title = markdownNavText(entry.name, content) || nameWithoutExt
        items.push({
          text: title,
          link: `${prefix}/03-business-process/${nameWithoutExt}`
        })
      }
    }
    return items
  } catch (e) {
    return []
  }
}

function getCrossCuttingSidebarItems(root: string, prefix: string) {
  const crossDir = path.join(root, prefix.replace(/^\//, ''), '08-cross-cutting')
  if (!fs.existsSync(crossDir)) return []
  try {
    const entries = fs.readdirSync(crossDir, { withFileTypes: true })
    const items = []
    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith('.md')) {
        const nameWithoutExt = entry.name.replace(/\.md$/, '')
        if (nameWithoutExt === 'index') continue
        let title = nameWithoutExt
        const content = fs.readFileSync(path.join(crossDir, entry.name), 'utf8')
        title = markdownNavText(entry.name, content) || content.match(/^#\s+(.+)$/m)?.[1]?.trim() || nameWithoutExt
        items.push({
          text: title,
          link: `${prefix}/08-cross-cutting/${nameWithoutExt}`
        })
      }
    }
    return items.sort((a, b) => a.text.localeCompare(b.text))
  } catch (e) {
    return []
  }
}

/**
 * Export as a function so VitePress re-evaluates sidebar on every
 * server.restart() — triggered by the watch-md-yaml-files plugin
 * whenever .md or .yaml files are added/removed.
 */
export default () => {
  const projectRoot = process.cwd()
  const docsDir = path.resolve(__dirname, '..')

  const hasProductArchitecture = fs.existsSync(path.join(projectRoot, 'architecture')) || fs.existsSync(path.join(docsDir, 'architecture'))
  const archPrefix = hasProductArchitecture ? '/architecture' : '/architecture'

  const hasProductOverview = fs.existsSync(path.join(projectRoot, 'overview')) || fs.existsSync(path.join(docsDir, 'overview'))
  const overviewPrefix = hasProductOverview ? '/overview' : '/overview'

  const hasProductSurfaces = fs.existsSync(path.join(projectRoot, 'surfaces')) || fs.existsSync(path.join(docsDir, 'surfaces'))
  const surfacesPrefix = hasProductSurfaces ? '/surfaces' : '/surfaces'

  return withMermaid(
    defineConfig({
      title: 'Base Docs',
      description: 'Platform docs hub — arc42 + product Code/common (R2)',
      cleanUrls: true,
      ignoreDeadLinks: true,
      srcExclude: [
        '**/node_modules/**',
        '**/scripts/**',
        '**/registries/**',
        '**/.cursor/**',
        '**/package.json',
        '**/platform-repos*.json',
        '**/legacy-repos*.json',
        '**/surfaces/**/code/**/*.yaml',
        '**/surfaces/**/code/**/ir/**',
        '**/ir/*.yaml',
        '**/qa/open/**',
      ],
      // Node sizes are computed from this font size — keep in sync with the CSS pin in theme/custom.css
      mermaid: {
        themeVariables: {
          fontSize: '18px',
        },
        flowchart: {
          useMaxWidth: true,
          htmlLabels: true,
          padding: 16,
          nodeSpacing: 50,
          rankSpacing: 60,
        },
        sequence: {
          useMaxWidth: true,
          diagramMarginX: 40,
          diagramMarginY: 20,
          actorMargin: 50,
          boxMargin: 12,
        },
      },
      vite: {
        plugins: [
          {
            name: 'watch-md-yaml-files',
            configureServer(server) {
              // Watch directories that contribute to sidebar
              const watchDirs = [
                path.join(projectRoot, 'architecture'),
                path.join(projectRoot, 'overview'),
                path.join(projectRoot, 'surfaces'),
                path.join(projectRoot, 'qa'),
                path.join(docsDir, 'architecture'),
                path.join(docsDir, 'overview'),
                path.join(docsDir, 'surfaces'),
                path.join(docsDir, 'qa'),
              ]
              for (const dir of watchDirs) {
                if (fs.existsSync(dir)) {
                  server.watcher.add(dir)
                }
              }

              const isSidebarRelevant = (file: string) =>
                file.endsWith('.md') || file.endsWith('.yaml') || file.endsWith('.yml')

              let restartTimer: ReturnType<typeof setTimeout> | null = null
              const debouncedRestart = () => {
                if (restartTimer) clearTimeout(restartTimer)
                restartTimer = setTimeout(() => server.restart(), 300)
              }

              server.watcher.on('change', (file) => {
                if (file.endsWith('.yaml') || file.endsWith('.yml')) debouncedRestart()
              })
              server.watcher.on('add', (file) => {
                if (isSidebarRelevant(file)) debouncedRestart()
              })
              server.watcher.on('unlink', (file) => {
                if (isSidebarRelevant(file)) debouncedRestart()
              })
            }
          },
          {
            name: 'watch-common-gen',
            configureServer(server) {
              const adapter = process.env.FLOWGRID_ADAPTER || 'nextjs'
              const webAdapters = new Set(['nuxt4', 'nextjs'])
              if (!webAdapters.has(adapter)) return

              // Collect all common/ dirs: surface-level + module-level
              const surfacesDir = path.join(projectRoot, 'surfaces')
              if (!fs.existsSync(surfacesDir)) return

              const commonDirs: string[] = []
              for (const entry of fs.readdirSync(surfacesDir, { withFileTypes: true })) {
                if (!entry.isDirectory() || entry.name.startsWith('.')) continue
                const surfaceCommon = path.join(surfacesDir, entry.name, 'common')
                if (fs.existsSync(surfaceCommon)) commonDirs.push(surfaceCommon)

                // Module-level: surfaces/<surface>/CMP-*/common
                const surfacePath = path.join(surfacesDir, entry.name)
                for (const child of fs.readdirSync(surfacePath, { withFileTypes: true })) {
                  if (!child.isDirectory() || !child.name.startsWith('CMP-')) continue
                  const moduleCommon = path.join(surfacePath, child.name, 'common')
                  if (fs.existsSync(moduleCommon)) commonDirs.push(moduleCommon)
                }
              }
              if (!commonDirs.length) return

              // Add common dirs to watcher
              for (const dir of commonDirs) {
                server.watcher.add(dir)
              }

              const isCommonSpec = (file: string) => {
                if (!file.endsWith('.yaml') && !file.endsWith('.yml')) return false
                const norm = file.split(path.sep).join('/')
                return commonDirs.some(d => norm.startsWith(d.split(path.sep).join('/')))
              }

              const flowgridRoot = path.resolve(__dirname, '..', '..', '..')
              const commonEngine = path.join(flowgridRoot, 'adapters', 'shared', 'common-gen.mjs')

              const runGenCommon = () => {
                const env = {
                  ...process.env,
                  FLOWGRID_PROJECT_ROOT: projectRoot,
                  FLOWGRID_ADAPTER: adapter,
                  FLOWGRID_DOCS_ROOT: projectRoot,
                }
                const res = spawnSync(process.execPath, [commonEngine, '--all-surfaces', '--all-modules'], {
                  cwd: projectRoot,
                  encoding: 'utf8',
                  env,
                })
                if (res.status === 0) {
                  const first = (res.stdout || '').split('\n').find(Boolean) || 'done'
                  console.log(`\x1b[32m[Common] rebuilt — ${first}\x1b[0m`)
                } else {
                  const msg = (res.stderr || res.stdout || '').trim().split('\n')[0]
                  console.log(`\x1b[33m[Common] rebuild skipped: ${msg || 'no sources'}\x1b[0m`)
                }
              }

              let genTimer: ReturnType<typeof setTimeout> | null = null
              const debouncedGenCommon = () => {
                if (genTimer) clearTimeout(genTimer)
                genTimer = setTimeout(() => {
                  console.log('\x1b[36m[Common] change detected — rebuilding...\x1b[0m')
                  runGenCommon()
                  server.restart()
                }, 300)
              }

              server.watcher.on('change', (file) => {
                if (isCommonSpec(file)) debouncedGenCommon()
              })
              server.watcher.on('add', (file) => {
                if (isCommonSpec(file)) debouncedGenCommon()
              })
              server.watcher.on('unlink', (file) => {
                if (isCommonSpec(file)) debouncedGenCommon()
              })

              console.log(`\x1b[34m[Common] watching ${commonDirs.length} common dir(s) for yaml changes\x1b[0m`)
            }
          }
        ],
        resolve: {
          dedupe: ['vue', 'vitepress', 'vitepress-plugin-mermaid', 'vitepress-mermaid-renderer'],
        },
        // vitepress-plugin-mermaid forces these into optimizeDeps; pnpm needs them as direct deps
        // (see .npmrc public-hoist-pattern). Do NOT alias dayjs → 'dayjs/' (breaks absolute resolve).
        optimizeDeps: {
          include: [
            'mermaid',
            'dayjs',
            'debug',
            'cytoscape',
            'cytoscape-cose-bilkent',
            '@braintree/sanitize-url',
          ],
        },
      },
      themeConfig: {
        nav: [
          { text: 'Home', link: '/' },
          { text: 'Overview', link: `${overviewPrefix}/` },
          { text: 'Surfaces', link: `${surfacesPrefix}/` },
        ],
        sidebar: [
          {
            text: 'Readme',
            collapsed: false,
            items: [
              { text: 'Readme', link: '/README' },
            ],
          },
          {
            text: 'Overview',
            collapsed: false,
            items: [
              { text: 'Overview', link: `${overviewPrefix}/` },
              ...getOverviewSidebar(projectRoot, docsDir, overviewPrefix)
            ]
          },
          {
            text: 'Surfaces',
            collapsed: false,
            items: getSurfacesSidebar(projectRoot, docsDir, surfacesPrefix),
          },
          {
            text: 'Architecture',
            collapsed: false,
            items: [
              { text: '01 Introduction', link: `${archPrefix}/01-introduction/` },
              { text: '02 Constraints', link: `${archPrefix}/02-constraints/` },
              {
                text: '03 Business Processes',
                collapsed: true,
                items: [
                  { text: 'Catalog', link: `${archPrefix}/03-business-process/` },
                  ...getBusinessProcessSidebarItems(projectRoot, archPrefix),
                ],
              },
              { text: '04 Solution Strategy', link: `${archPrefix}/04-solution-strategy/` },
              { text: '07 Deployment', link: `${archPrefix}/07-deployment/` },
              {
                text: '08 Cross-cutting',
                collapsed: true,
                items: [
                  { text: 'Index', link: `${archPrefix}/08-cross-cutting/` },
                  ...getCrossCuttingSidebarItems(projectRoot, archPrefix),
                ],
              },
              { text: '09 Decisions', link: `${archPrefix}/09-decisions/` },
              {
                text: '10–12 Quality & Risks',
                collapsed: true,
                items: [
                  { text: '10 Quality', link: `${archPrefix}/10-quality/` },
                  { text: '11 Risks', link: `${archPrefix}/11-risks/` },
                  { text: '12 Glossary', link: `${archPrefix}/12-glossary/` },
                ],
              },
              { text: 'Architecture Trace', link: '/ARCHITECTURE-TRACE' },
              { text: 'Legacy dynamics', link: '/legacy-dynamics/' },
            ],
          },
          {
            text: 'QA',
            collapsed: true,
            items: [{ text: 'Danh sách QA', link: '/qa/' }],
          },
        ],
      },
    }),
  )
}
