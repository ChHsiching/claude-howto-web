import { defineConfig } from 'vitepress'
import { resolve } from 'node:path'
import { existsSync } from 'node:fs'
import sidebar from './sidebar.json'

const base = '/claude-howto-web/'
const docsRoot = resolve(import.meta.dirname, '..')

export default defineConfig({
  base,
  title: 'Claude How-To',
  description: 'Master Claude Code in a Weekend',
  cleanUrls: true,
  lastUpdated: true,
  ignoreDeadLinks: true,
  sitemap: {
    hostname: `https://chhsiching.github.io${base}`,
  },
  vite: {
    plugins: [
      {
        name: 'resolve-docs-images',
        enforce: 'pre',
        resolveId(source) {
          if (!source.startsWith('/')) return
          if (!/\.(svg|png|jpg|jpeg|gif|webp|ico)$/.test(source)) return
          const filePath = resolve(docsRoot, source.slice(1))
          if (existsSync(filePath)) return filePath
        },
      },
    ],
  },
  markdown: {
    image: {
      lazyLoading: true,
    },
  },
  locales: {
    root: {
      label: 'English',
      lang: 'en',
      title: 'Claude How-To',
      description: 'Master Claude Code in a Weekend',
    },
    vi: {
      label: 'Tiếng Việt',
      lang: 'vi',
      title: 'Hướng Dẫn Claude Code',
      description: 'Làm chủ Claude Code trong một cuối tuần',
    },
    zh: {
      label: '中文',
      lang: 'zh',
      title: 'Claude How-To',
      description: '用一个周末掌握 Claude Code',
    },
    uk: {
      label: 'Українська',
      lang: 'uk',
      title: 'Claude How-To',
      description: 'Опануй Claude Code за вихідні',
    },
  },
  themeConfig: {
    logo: '/claude-howto-logo.svg',
    siteTitle: 'Claude How-To',
    nav: nav(),
    search: {
      provider: 'local',
    },
    sidebar,
    socialLinks: [
      { icon: 'github', link: 'https://github.com/luongnv89/claude-howto' },
    ],
    footer: {
      message: 'Based on <a href="https://github.com/luongnv89/claude-howto">luongnv89/claude-howto</a> — MIT License',
    },
    docFooter: {
      prev: 'Previous',
      next: 'Next',
    },
  },
})

function nav() {
  return [
    { text: 'Home', link: '/' },
    {
      text: 'Modules',
      items: [
        { text: 'Slash Commands', link: '/01-slash-commands/' },
        { text: 'Memory', link: '/02-memory/' },
        { text: 'Skills', link: '/03-skills/' },
        { text: 'Subagents', link: '/04-subagents/' },
        { text: 'MCP', link: '/05-mcp/' },
        { text: 'Hooks', link: '/06-hooks/' },
        { text: 'Plugins', link: '/07-plugins/' },
        { text: 'Checkpoints', link: '/08-checkpoints/' },
        { text: 'Advanced', link: '/09-advanced-features/' },
        { text: 'CLI', link: '/10-cli/' },
      ],
    },
    {
      text: 'Resources',
      items: [
        { text: 'Catalog', link: '/CATALOG' },
        { text: 'Learning Roadmap', link: '/LEARNING-ROADMAP' },
        { text: 'Quick Reference', link: '/QUICK_REFERENCE' },
        { text: 'Upstream Repo', link: 'https://github.com/luongnv89/claude-howto' },
      ],
    },
  ]
}
