import { cpSync, mkdirSync, rmSync, existsSync, readdirSync, statSync, writeFileSync, readFileSync, renameSync } from 'node:fs'
import { join, relative, resolve, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const UPSTREAM = resolve(ROOT, 'upstream')
const DOCS = resolve(ROOT, 'docs')

const LANGUAGES = [
  { code: 'en', source: UPSTREAM, target: DOCS },
  { code: 'vi', source: join(UPSTREAM, 'vi'), target: join(DOCS, 'vi') },
  { code: 'zh', source: join(UPSTREAM, 'zh'), target: join(DOCS, 'zh') },
  { code: 'uk', source: join(UPSTREAM, 'uk'), target: join(DOCS, 'uk') },
]

const EXCLUDE_DIRS = new Set(['.git', 'node_modules', 'local-progress', '.github'])
const EXCLUDE_FILES = new Set(['coverage.xml', 'INDEX.md'])
const SKIP_FOR_ROOT = new Set(['vi', 'zh', 'uk'])

const EXCLUDE_SIDEBAR_FILES = new Set([
  'CHANGELOG.md', 'CONTRIBUTING.md', 'CODE_OF_CONDUCT.md',
  'SECURITY.md', 'STYLE_GUIDE.md', 'CLAUDE.md',
])
const EXCLUDE_SIDEBAR_DIRS = new Set(['docs', 'prompts', 'scripts', 'resources'])
const PROTECTED_FILES = new Set(['index.md', 'README.md'])

function listFiles(dir, baseDir = dir, prefix = '') {
  const files = []
  if (!existsSync(dir)) return files

  for (const entry of readdirSync(dir)) {
    if (EXCLUDE_DIRS.has(entry)) continue
    const fullPath = join(dir, entry)
    const relPath = prefix ? `${prefix}/${entry}` : entry

    if (statSync(fullPath).isDirectory()) {
      files.push(...listFiles(fullPath, baseDir, relPath))
    } else if (!EXCLUDE_FILES.has(entry)) {
      files.push(relPath)
    }
  }
  return files
}

function isCustomHomepage(filePath) {
  if (!existsSync(filePath)) return false
  const content = readFileSync(filePath, 'utf-8')
  return content.includes('layout: home')
}

function clearTarget(targetDir, isRoot = false) {
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true })
    return
  }

  for (const entry of readdirSync(targetDir)) {
    if (isRoot && (entry === '.vitepress' || SKIP_FOR_ROOT.has(entry) || PROTECTED_FILES.has(entry))) continue
    if (!isRoot && (entry === '.vitepress')) continue
    if (!isRoot && PROTECTED_FILES.has(entry)) {
      const fullPath = join(targetDir, entry)
      if (isCustomHomepage(fullPath)) continue
    }
    const fullPath = join(targetDir, entry)
    rmSync(fullPath, { recursive: true, force: true })
  }
}

function syncLanguage(lang) {
  const { code, source, target } = lang
  const isRoot = code === 'en'

  if (!existsSync(source)) {
    console.warn(`Source directory not found: ${source} — skipping ${code}`)
    return
  }

  console.log(`Syncing ${code}...`)
  clearTarget(target, isRoot)

  const files = listFiles(source)
  let copied = 0

  for (const file of files) {
    if (isRoot) {
      const topDir = file.split('/')[0]
      if (SKIP_FOR_ROOT.has(topDir)) continue
    }

    // Skip top-level index.md — our custom homepage
    if (!file.includes('/') && file === 'index.md') continue

    const src = join(source, file)
    const dest = join(target, file)
    const destDir = dirname(dest)

    mkdirSync(destDir, { recursive: true })
    cpSync(src, dest)
    copied++
  }

  console.log(`  ${code}: copied ${copied} files`)
}

const MODULE_DIRS = /^(\d+-(?:slash-commands|memory|skills|subagents|mcp|hooks|plugins|checkpoints|advanced-features|cli))/

function generateSidebarItems(dir, basePath = '', langCode = 'en') {
  if (!existsSync(dir)) return []

  const items = []
  const entries = readdirSync(dir).sort()
  const isTopLevel = langCode === 'en' ? basePath === '' : basePath === langCode

  const mdFiles = []
  const subDirs = []

  for (const entry of entries) {
    if (entry.startsWith('.')) continue
    if (langCode === 'en' && isTopLevel && SKIP_FOR_ROOT.has(entry)) continue
    if (isTopLevel && EXCLUDE_SIDEBAR_FILES.has(entry)) continue
    if (isTopLevel && EXCLUDE_SIDEBAR_DIRS.has(entry)) continue
    const fullPath = join(dir, entry)
    const relPath = basePath ? `${basePath}/${entry}` : entry

    if (statSync(fullPath).isDirectory()) {
      subDirs.push({ name: entry, path: fullPath, rel: relPath })
    } else if (entry.endsWith('.md')) {
      mdFiles.push({ name: entry, rel: relPath })
    }
  }

  const moduleSubs = []
  const otherSubs = []

  for (const sub of subDirs) {
    if (MODULE_DIRS.test(sub.name)) {
      moduleSubs.push(sub)
    } else {
      otherSubs.push(sub)
    }
  }

  for (const sub of moduleSubs) {
    const subItems = generateSidebarItems(sub.path, sub.rel, langCode)
    if (subItems.length > 0) {
      const hasIndex = existsSync(join(sub.path, 'index.md'))
      items.push({
        text: sidebarGroupTitle(sub, langCode),
        ...(hasIndex && { link: `/${sub.rel}/` }),
        items: subItems,
        collapsed: false,
      })
    }
  }

  if (mdFiles.length > 0 || otherSubs.length > 0) {
    const readmeItems = []
    const otherMdItems = []

    for (const f of mdFiles) {
      if (isTopLevel && f.name === 'index.md') continue
      const item = {
        text: sidebarTitle(f, langCode),
        link: `/${f.rel.replace(/\.md$/, '')}`,
      }
      if (f.name === 'README.md') {
        readmeItems.push(item)
      } else {
        otherMdItems.push(item)
      }
    }

    const generalItems = [...readmeItems, ...otherMdItems]
    for (const sub of otherSubs) {
      const subItems = generateSidebarItems(sub.path, sub.rel, langCode)
      if (subItems.length > 0) {
        const hasIndex = existsSync(join(sub.path, 'index.md'))
        generalItems.push({
          text: sidebarGroupTitle(sub, langCode),
          ...(hasIndex && { link: `/${sub.rel}/` }),
          items: subItems,
          collapsed: false,
        })
      }
    }
    if (moduleSubs.length > 0) {
      items.unshift({ text: 'General', items: generalItems, collapsed: false })
    } else {
      items.unshift(...generalItems)
    }
  }

  return items
}

const MODULE_TITLES = {
  '01-slash-commands': 'Slash Commands',
  '02-memory': 'Memory',
  '03-skills': 'Skills',
  '04-subagents': 'Subagents',
  '05-mcp': 'MCP Protocol',
  '06-hooks': 'Hooks',
  '07-plugins': 'Plugins',
  '08-checkpoints': 'Checkpoints',
  '09-advanced-features': 'Advanced Features',
  '10-cli': 'CLI Reference',
}

function extractTitle(filePath) {
  if (!existsSync(filePath)) return null
  const content = readFileSync(filePath, 'utf-8')
  const match = content.match(/^#\s+(.+)$/m)
  return match ? match[1].trim() : null
}

function sidebarTitle(file, langCode) {
  if (langCode === 'en') return makeTitle(file.name.replace(/\.md$/, ''))
  const fullFilePath = join(DOCS, file.rel)
  const title = extractTitle(fullFilePath)
  return title || makeTitle(file.name.replace(/\.md$/, ''))
}

function sidebarGroupTitle(sub, langCode) {
  if (langCode === 'en' || MODULE_TITLES[sub.name]) return makeTitle(sub.name)
  const indexPath = join(DOCS, sub.rel, 'index.md')
  const title = extractTitle(indexPath)
  return title || makeTitle(sub.name)
}

function makeTitle(name) {
  if (MODULE_TITLES[name]) return MODULE_TITLES[name]
  return name.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function generateSidebarConfig() {
  const sidebar = {}

  for (const lang of LANGUAGES) {
    const targetDir = lang.code === 'en' ? DOCS : join(DOCS, lang.code)
    const prefix = lang.code === 'en' ? '' : `${lang.code}`
    const items = generateSidebarItems(targetDir, prefix, lang.code)
    if (items.length > 0) {
      sidebar[`/${lang.code === 'en' ? '' : lang.code + '/'}`] = items
    }
  }

  const outputPath = join(DOCS, '.vitepress', 'sidebar.json')
  writeFileSync(outputPath, JSON.stringify(sidebar, null, 2))
  console.log(`Generated sidebar config: ${outputPath}`)
}

const SHARED_ASSET_DIRS = ['resources/logos', 'resources/icons', 'resources/favicons', 'assets']
const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico'])

function copySharedAssets() {
  for (const lang of LANGUAGES) {
    if (lang.code === 'en') continue

    for (const assetDir of SHARED_ASSET_DIRS) {
      const src = join(UPSTREAM, assetDir)
      const dest = join(lang.target, assetDir)
      if (existsSync(src) && !existsSync(dest)) {
        cpSync(src, dest, { recursive: true })
        console.log(`  Shared assets: ${assetDir} → ${lang.code}/`)
      }
    }

    const enFiles = listFiles(UPSTREAM)
    let copiedImages = 0
    for (const file of enFiles) {
      const ext = file.substring(file.lastIndexOf('.')).toLowerCase()
      if (!IMAGE_EXTS.has(ext)) continue
      if (SKIP_FOR_ROOT.has(file.split('/')[0])) continue

      const src = join(UPSTREAM, file)
      const dest = join(lang.target, file)
      if (!existsSync(dest)) {
        mkdirSync(dirname(dest), { recursive: true })
        cpSync(src, dest)
        copiedImages++
      }
    }
    if (copiedImages > 0) console.log(`  Copied ${copiedImages} shared images → ${lang.code}/`)
  }
}

const IMG_ATTR_RE = /(src|srcset)="([^"]+)"/g

function renameReadmeToIndex() {
  let renamed = 0
  for (const lang of LANGUAGES) {
    const mdFiles = listMdFiles(lang.target)
    for (const file of mdFiles) {
      if (basename(file) !== 'README.md') continue
      // Skip top-level README.md — our custom homepage takes that slot
      if (dirname(file) === '.') continue
      const oldPath = join(lang.target, file)
      const newPath = join(lang.target, dirname(file), 'index.md')
      if (!existsSync(newPath)) {
        renameSync(oldPath, newPath)
        renamed++
      }
    }
  }
  if (renamed > 0) console.log(`  Renamed ${renamed} README.md → index.md`)
}

function rewriteImagePaths(lang) {
  const { code, target } = lang
  const urlPrefix = code === 'en' ? '/' : `/${code}/`
  const mdFiles = listMdFiles(target)
  let rewritten = 0

  for (const file of mdFiles) {
    const filePath = join(target, file)
    let content = readFileSync(filePath, 'utf-8')
    let changed = false
    const fileDir = dirname(file)

    content = content.replace(IMG_ATTR_RE, (match, attr, pathValue) => {
      if (pathValue.startsWith('http') || pathValue.startsWith('/') || pathValue.startsWith('data:')) return match
      const base = fileDir ? `file:///${fileDir}/` : 'file:///'
      const resolved = new URL(pathValue, base).pathname.slice(1)
      const newMatch = `${attr}="${urlPrefix}${resolved}"`
      changed = true
      return newMatch
    })

    if (changed) {
      writeFileSync(filePath, content)
      rewritten++
    }
  }

  if (rewritten > 0) console.log(`  Rewrote image paths in ${rewritten} ${code} files`)
}

function listMdFiles(dir, prefix = '') {
  const files = []
  if (!existsSync(dir)) return files
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith('.')) continue
    const fullPath = join(dir, entry)
    const rel = prefix ? `${prefix}/${entry}` : entry
    if (statSync(fullPath).isDirectory()) {
      files.push(...listMdFiles(fullPath, rel))
    } else if (entry.endsWith('.md')) {
      files.push(rel)
    }
  }
  return files
}

// Main
console.log('=== Content Sync ===')
for (const lang of LANGUAGES) {
  syncLanguage(lang)
}
copySharedAssets()
renameReadmeToIndex()
for (const lang of LANGUAGES) {
  rewriteImagePaths(lang)
}

const CUSTOM_LOGOS = [
  { src: resolve(ROOT, 'assets/logo/logo-light.webp'), dest: resolve(DOCS, 'assets/logo/logo-light.webp') },
  { src: resolve(ROOT, 'assets/logo/logo-dark.webp'), dest: resolve(DOCS, 'assets/logo/logo-dark.webp') },
]

function copyCustomLogos() {
  let copied = 0
  for (const { src, dest } of CUSTOM_LOGOS) {
    if (!existsSync(src)) continue
    mkdirSync(dirname(dest), { recursive: true })
    cpSync(src, dest)
    copied++
  }
  if (copied > 0) console.log(`  Copied ${copied} custom logos to docs/assets/logo/`)
}

copyCustomLogos()
console.log('\n=== Generating Sidebar ===')
generateSidebarConfig()
console.log('\nSync complete.')
