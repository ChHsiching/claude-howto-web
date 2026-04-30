import { defineConfig } from 'vitepress'
import { resolve } from 'node:path'
import { existsSync } from 'node:fs'
import taskLists from 'markdown-it-task-lists'
import sidebar from './sidebar.json'

const base = '/claude-howto-web/'
const docsRoot = resolve(import.meta.dirname, '..')

export default defineConfig({
  base,
  head: [
    ['link', { rel: 'icon', href: `${base}favicon-light.png`, media: '(prefers-color-scheme: light)' }],
    ['link', { rel: 'icon', href: `${base}favicon-dark.png`, media: '(prefers-color-scheme: dark)' }],
  ],
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
    theme: {
      light: 'vitesse-light',
      dark: 'vitesse-dark',
    },
    config(md) {
      md.use(taskLists)
    },
  },
  locales: {
    root: {
      label: 'English',
      lang: 'en',
      title: 'Claude How-To',
      description: 'Master Claude Code in a Weekend',
      themeConfig: {
        nav: navEn(),
        sidebar,
        docFooter: { prev: 'Previous', next: 'Next' },
      },
    },
    vi: {
      label: 'Tiếng Việt',
      lang: 'vi',
      title: 'Hướng Dẫn Claude Code',
      description: 'Làm chủ Claude Code trong một cuối tuần',
      themeConfig: {
        nav: navVi(),
        sidebar,
        docFooter: { prev: 'Trước', next: 'Tiếp' },
      },
    },
    zh: {
      label: '中文',
      lang: 'zh',
      title: 'Claude How-To',
      description: '用一个周末掌握 Claude Code',
      themeConfig: {
        nav: navZh(),
        sidebar,
        docFooter: { prev: '上一页', next: '下一页' },
      },
    },
    uk: {
      label: 'Українська',
      lang: 'uk',
      title: 'Claude How-To',
      description: 'Опануй Claude Code за вихідні',
      themeConfig: {
        nav: navUk(),
        sidebar,
        docFooter: { prev: 'Попередня', next: 'Наступна' },
      },
    },
  },
  themeConfig: {
    logo: { light: '/assets/logo/logo-light.webp', dark: '/assets/logo/logo-dark.webp' },
    siteTitle: 'Claude How-To',
    search: {
      provider: 'local',
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/luongnv89/claude-howto' },
    ],
    footer: {
      message: 'Based on <a href="https://github.com/luongnv89/claude-howto">luongnv89/claude-howto</a> — MIT License',
    },
  },
})

function navEn() {
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

function navVi() {
  return [
    { text: 'Trang chủ', link: '/vi/' },
    {
      text: 'Mô-đun',
      items: [
        { text: 'Lệnh Slash', link: '/vi/01-slash-commands/' },
        { text: 'Bộ nhớ', link: '/vi/02-memory/' },
        { text: 'Kỹ năng', link: '/vi/03-skills/' },
        { text: 'Agent phụ', link: '/vi/04-subagents/' },
        { text: 'MCP', link: '/vi/05-mcp/' },
        { text: 'Hooks', link: '/vi/06-hooks/' },
        { text: 'Plugin', link: '/vi/07-plugins/' },
        { text: 'Điểm lưu', link: '/vi/08-checkpoints/' },
        { text: 'Nâng cao', link: '/vi/09-advanced-features/' },
        { text: 'CLI', link: '/vi/10-cli/' },
      ],
    },
    {
      text: 'Tài nguyên',
      items: [
        { text: 'Danh mục', link: '/vi/CATALOG' },
        { text: 'Lộ trình', link: '/vi/LEARNING-ROADMAP' },
        { text: 'Tham khảo nhanh', link: '/vi/QUICK_REFERENCE' },
        { text: 'Kho上游', link: 'https://github.com/luongnv89/claude-howto' },
      ],
    },
  ]
}

function navZh() {
  return [
    { text: '首页', link: '/zh/' },
    {
      text: '模块',
      items: [
        { text: '斜杠命令', link: '/zh/01-slash-commands/' },
        { text: '记忆', link: '/zh/02-memory/' },
        { text: '技能', link: '/zh/03-skills/' },
        { text: '子代理', link: '/zh/04-subagents/' },
        { text: 'MCP', link: '/zh/05-mcp/' },
        { text: '钩子', link: '/zh/06-hooks/' },
        { text: '插件', link: '/zh/07-plugins/' },
        { text: '检查点', link: '/zh/08-checkpoints/' },
        { text: '高级功能', link: '/zh/09-advanced-features/' },
        { text: 'CLI', link: '/zh/10-cli/' },
      ],
    },
    {
      text: '资源',
      items: [
        { text: '目录', link: '/zh/CATALOG' },
        { text: '学习路线', link: '/zh/LEARNING-ROADMAP' },
        { text: '速查表', link: '/zh/QUICK_REFERENCE' },
        { text: '上游仓库', link: 'https://github.com/luongnv89/claude-howto' },
      ],
    },
  ]
}

function navUk() {
  return [
    { text: 'Головна', link: '/uk/' },
    {
      text: 'Модулі',
      items: [
        { text: 'Slash-команди', link: '/uk/01-slash-commands/' },
        { text: "Пам'ять", link: '/uk/02-memory/' },
        { text: 'Навички', link: '/uk/03-skills/' },
        { text: 'Підагенти', link: '/uk/04-subagents/' },
        { text: 'MCP', link: '/uk/05-mcp/' },
        { text: 'Хуки', link: '/uk/06-hooks/' },
        { text: 'Плагіни', link: '/uk/07-plugins/' },
        { text: 'Контрольні точки', link: '/uk/08-checkpoints/' },
        { text: 'Додаткові функції', link: '/uk/09-advanced-features/' },
        { text: 'CLI', link: '/uk/10-cli/' },
      ],
    },
    {
      text: 'Ресурси',
      items: [
        { text: 'Каталог', link: '/uk/CATALOG' },
        { text: 'Навчальний план', link: '/uk/LEARNING-ROADMAP' },
        { text: 'Довідка', link: '/uk/QUICK_REFERENCE' },
        { text: 'Вихідний репозиторій', link: 'https://github.com/luongnv89/claude-howto' },
      ],
    },
  ]
}
