<svelte:head>
  <title>关于 X-Plan — 国内 AI 编程助手对比平台</title>
  <meta name="description" content="X-Plan 是国内 AI 编程助手（Coding Plan）对比平台，帮助开发者快速对比各平台 API 套餐价格与功能" />
  <meta property="og:title" content="关于 X-Plan" />
  <meta property="og:description" content="国内 AI 编程助手对比平台" />
  <meta property="og:url" content="https://x-plan.pages.dev/about" />
  <link rel="canonical" href="https://x-plan.pages.dev/about" />
</svelte:head>

<div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div class="hero-block">
    <h1>关于本站</h1>
  </div>

  <div class="space-y-4">
    <div class="panel-card p-6">
      <h2 class="text-xl font-semibold mb-3" style="color: var(--brand);">📊 X-Plan 是什么？</h2>
      <p class="leading-relaxed" style="color: var(--text-soft);">
        X-Plan 是一个国内 AI 编程助手（Coding Plan）的对比平台。我们收集整理了国内主流 AI 编程平台的套餐价格、支持模型、适配工具等信息，帮助开发者快速找到最适合自己的方案。
      </p>
    </div>

    <div class="panel-card p-6">
      <h2 class="text-xl font-semibold mb-3" style="color: var(--brand);">🎯 为什么做这个？</h2>
      <p class="leading-relaxed" style="color: var(--text-soft);">
        随着 AI 编程工具的爆发式增长，各平台的定价策略、计费方式、功能差异越来越大。开发者很难快速了解哪个平台最适合自己的需求。X-Plan 旨在解决这个信息差问题。
      </p>
    </div>

    <div class="panel-card p-6">
      <h2 class="text-xl font-semibold mb-3" style="color: var(--brand);">📋 数据来源</h2>
      <p class="leading-relaxed" style="color: var(--text-soft);">
        所有数据均来自各平台官网公开信息，通过自动化爬虫定期更新。我们会尽力保证数据的准确性，但价格和政策可能随时变化，请以各平台官网为准。
      </p>
    </div>

    <div class="panel-card p-6">
      <h2 class="text-xl font-semibold mb-3" style="color: var(--brand);">⚙️ 技术栈</h2>
      <ul class="space-y-2" style="color: var(--text-soft);">
        <li>• 前端：SvelteKit 2 + Svelte 5 + Tailwind CSS 4</li>
        <li>• 数据库：Cloudflare D1 (边缘 SQLite)</li>
        <li>• 爬虫：fetch + cheerio (轻量) / Playwright (重量)</li>
        <li>• 部署：Cloudflare Pages + Workers</li>
      </ul>
    </div>

    <div class="panel-card p-6" style="border-color: rgba(49, 213, 255, 0.3);">
      <h2 class="text-xl font-semibold mb-3" style="color: var(--brand);">💡 免责声明</h2>
      <p class="leading-relaxed" style="color: var(--text-soft);">
        本站数据仅供参考，不构成任何购买建议。各平台的价格、功能、政策可能随时调整，请以官方最新信息为准。如有数据错误，欢迎反馈。
      </p>
    </div>
  </div>
</div>
