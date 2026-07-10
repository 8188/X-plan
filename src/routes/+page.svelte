<script lang="ts">
  import PlatformFilters from '$lib/components/PlatformFilters.svelte';
  import PlatformTable from '$lib/components/PlatformTable.svelte';
  import FAQ from '$lib/components/FAQ.svelte';
  import type { Platform, FAQ as FAQType } from '$lib/db/types';

  let platforms = $state<Platform[]>([]);
  let faqs = $state<FAQType[]>([]);
  let loading = $state(true);

  async function fetchData(filters?: { search?: string; category?: string; billing_unit?: string; platform_type?: string; accessibility?: string; sort?: string; order?: string }) {
    loading = true;
    try {
      const params = new URLSearchParams();
      // 默认只显示 API 平台
      params.set('platform_type', filters?.platform_type || 'api');
      if (filters?.search) params.set('search', filters.search);
      if (filters?.category) params.set('category', filters.category);
      if (filters?.billing_unit) params.set('billing_unit', filters.billing_unit);
      if (filters?.accessibility) params.set('accessibility', filters.accessibility);
      if (filters?.sort) params.set('sort', filters.sort);
      if (filters?.order) params.set('order', filters.order);

      const [platformsRes, faqRes] = await Promise.all([
        fetch(`/api/platforms?${params.toString()}`),
        fetch('/api/faq'),
      ]);

      if (platformsRes.ok) platforms = await platformsRes.json();
      if (faqRes.ok) faqs = await faqRes.json();
    } catch (e) {
      console.error('Failed to fetch data:', e);
    }
    loading = false;
  }

  function handleFilterChange(filters: { search: string; category: string; billing_unit: string; accessibility: string; sort: string; order: string }) {
    fetchData(filters);
  }

  // 初始加载
  fetchData();
</script>

<svelte:head>
  <title>AI Coding Plan 对比 | X-Plan — 国内 AI 编程助手 API 价格对比</title>
  <meta name="description" content="一站式对比国内 AI 编程助手 API 套餐价格与功能，涵盖腾讯云、阿里云、百度千帆、火山引擎等 18+ 平台，支持按价格、计费方式、地区筛选" />
  <meta property="og:title" content="AI Coding Plan 对比 | X-Plan" />
  <meta property="og:description" content="一站式对比国内 AI 编程助手 API 套餐价格与功能，涵盖 18+ 平台" />
  <meta property="og:url" content="https://x-plan.pages.dev/" />
  <link rel="canonical" href="https://x-plan.pages.dev/" />
</svelte:head>

{@html '<script type="application/ld+json">{"@context":"https://schema.org","@type":"WebApplication","name":"X-Plan","description":"国内 AI 编程助手 Coding Plan 对比平台","url":"https://x-plan.pages.dev","applicationCategory":"DeveloperApplication","operatingSystem":"Web","offers":{"@type":"AggregateOffer","priceCurrency":"CNY","lowPrice":"0","highPrice":"999"}}</script>'}

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
  <!-- 页面标题 -->
  <div class="hero-block">
    <h1>AI Coding Plan 对比</h1>
    <p>一站式对比 AI 编程助手 API 套餐价格与功能 | <a href="/ide">查看 IDE/Agent 工具对比 →</a></p>
  </div>

  <!-- 筛选 -->
  <PlatformFilters onFilterChange={handleFilterChange} />

  <!-- 加载状态 -->
  {#if loading}
    <div class="py-16 text-center">
      <div class="animate-spin inline-block w-8 h-8 border-3 rounded-full" style="border-color: var(--brand); border-top-color: transparent;"></div>
      <p class="mt-4" style="color: var(--text-soft);">加载中...</p>
    </div>
  {:else}
    <!-- 平台对比表格 -->
    <PlatformTable {platforms} />

    <!-- FAQ -->
    {#if faqs.length > 0}
      <div class="mt-8">
        <h2 class="text-lg font-bold mb-4" style="color: var(--text);">❓ 常见问题</h2>
        <FAQ {faqs} />
      </div>
    {/if}
  {/if}
</div>
