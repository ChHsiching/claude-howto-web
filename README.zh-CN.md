🌐 **Language / 语言:** [English](README.md) | [中文](README.zh-CN.md)

# claude-howto-web

基于 VitePress 的静态站点，以 5 种语言忠实呈现 [luongnv89/claude-howto](https://github.com/luongnv89/claude-howto) 的内容。

## 特性

- **多语言**: English、Tiếng Việt、中文、Українська、日本語 — 使用 VitePress i18n
- **动态侧边栏**: 根据上游内容结构自动生成
- **自动同步**: 通过 git submodule 每 6 小时从上游拉取内容
- **CI/CD**: GitHub Actions 自动构建并部署到 GitHub Pages

## 快速开始

```bash
# 克隆（含 submodule）
git clone --recurse-submodules https://github.com/ChHsiching/claude-howto-web.git
cd claude-howto-web

# 使用正确的 Node 版本
nvm use

# 安装依赖
npm install

# 启动开发服务器（会先同步内容）
npm run docs:dev
```

## 脚本

| 命令 | 说明 |
|------|------|
| `npm run sync` | 从上游 submodule 同步内容 |
| `npm run docs:dev` | 同步 + 启动开发服务器 |
| `npm run docs:build` | 同步 + 构建静态站点 |
| `npm run docs:preview` | 预览已构建的站点 |

## 内容同步机制

1. `scripts/sync-content.mjs` 读取 `upstream/` 目录的 git submodule
2. 将英文内容复制到 `docs/`（根语言目录），其他语言复制到 `docs/{lang}/`
3. 将相对图片路径改写为绝对路径，以兼容 VitePress
4. 将共享资源（Logo、图标）复制到各语言目录
5. 根据目录结构生成 `docs/.vitepress/sidebar.json`

上游源文件不会被修改。

## 更新上游 Submodule

```bash
# 拉取最新上游变更
git submodule update --remote upstream

# 提交更新
git add upstream
git commit -m "chore: update upstream submodule"
```

## GitHub Actions 工作流

### 部署 (`deploy.yml`)
- 推送到 `main` 分支时触发
- 构建并部署到 GitHub Pages

### 同步 (`sync.yml`)
- **定时触发**: 每 6 小时检查上游是否有新提交
- **手动触发**: 在 Actions 标签页通过 `workflow_dispatch` 触发
- **智能构建**: 仅在上游有新提交时才同步和构建
- 同步内容提交到 `develop`，然后合并到 `main`（触发部署）

## 项目结构

```
├── .github/workflows/
│   ├── deploy.yml                # 部署到 GitHub Pages
│   └── sync.yml                  # 上游同步（每 6 小时）
├── docs/
│   ├── .vitepress/config.ts      # VitePress 配置（含 i18n）
│   ├── .vitepress/sidebar.json   # 自动生成的侧边栏
│   ├── index.md                  # 首页
│   ├── 01-slash-commands/ ...    # 英文内容（根语言目录）
│   ├── vi/                       # 越南语
│   ├── zh/                       # 中文
│   ├── uk/                       # 乌克兰语
│   └── ja/                       # 日语
├── scripts/sync-content.mjs      # 内容同步 + 侧边栏生成
├── upstream/                     # git submodule（luongnv89/claude-howto）
└── package.json
```

## 许可证

内容来自 [luongnv89/claude-howto](https://github.com/luongnv89/claude-howto)（MIT 许可证）。
