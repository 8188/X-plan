# X-Plan

国内 AI 编程助手 API 套餐价格对比 — [x-plan-site.pages.dev](https://x-plan-site.pages.dev)

## 本地开发

```sh
pnpm install
pnpm dev          # 前端热更新（无 D1）
```

## 本地完整预览（含 D1 数据库）

修改了 seed 数据后，必须 **build → preview → seed** 三步才能看到效果：

```sh
pnpm build                                    # 1. 构建
pnpm preview                                  # 2. 启动本地 D1 预览（端口 8788）
SITE_URL=http://127.0.0.1:8788 pnpm seed     # 3. 注入数据（另开终端）
```

> seed 会自动初始化 schema 并覆盖所有平台数据，无需手动建表。

## 部署

Cloudflare Pages 直连 GitHub 仓库，push 到 `main` 自动构建部署。

首次配置：Cloudflare Dashboard → Pages → Create project → 连接 GitHub 仓库，构建设置：
- Build command: `pnpm build`
- Build output: `.svelte-kit/cloudflare`

环境变量在 Dashboard → Settings → Environment variables 中配置（`ADMIN_SECRET` 等）。

## 数据更新

平台套餐数据维护在 `src/crawler/seed.ts`，修改后本地 build → preview → seed 验证，push 后自动上线。

## 自动爬虫

GitHub Actions 每日北京时间 10:00 自动运行轻量爬虫，抓取各平台最新价格并写入线上 D1。

- 定时任务：`.github/workflows/crawl.yml`
- 爬虫脚本：`scripts/crawl.ts`
- 爬虫框架：`src/crawler/`（轻量爬虫用 fetch + cheerio，重量爬虫用 Playwright）

需在 GitHub 仓库 Settings → Secrets 中配置 `ADMIN_SECRET`。
