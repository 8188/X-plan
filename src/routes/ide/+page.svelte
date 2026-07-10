<script lang="ts">
  import IDEPlatformFilters from '$lib/components/IDEPlatformFilters.svelte';
  import IDEPlatformTable from '$lib/components/IDEPlatformTable.svelte';
  import type { Platform } from '$lib/db/types';

  let platforms = $state<Platform[]>([]);
  let loading = $state(true);

  async function fetchData(filters?: { search?: string; accessibility?: string; sort?: string; order?: string }) {
    loading = true;
    try {
      const params = new URLSearchParams();
      params.set('platform_type', 'ide');
      if (filters?.search) params.set('search', filters.search);
      if (filters?.accessibility) params.set('accessibility', filters.accessibility);
      if (filters?.sort) params.set('sort', filters.sort);
      if (filters?.order) params.set('order', filters.order);

      const platformsRes = await fetch(`/api/platforms?${params.toString()}`);

      if (platformsRes.ok) platforms = await platformsRes.json();
    } catch (e) {
      console.error('Failed to fetch data:', e);
    }
    loading = false;
  }

  function handleFilterChange(filters: { search: string; accessibility: string; sort: string; order: string }) {
    fetchData(filters);
  }

  fetchData();
</script>

<svelte:head>
  <title>AI IDE / Agent 工具对比 | X-Plan — Cursor、Copilot、Claude Code 价格对比</title>
  <meta name="description" content="对比 AI 编程 IDE 和 Agent 工具价格与功能，涵盖 Cursor、GitHub Copilot、Claude Code、Windsurf、Trae 等 10+ 工具" />
  <meta property="og:title" content="AI IDE / Agent 工具对比 | X-Plan" />
  <meta property="og:description" content="对比 AI 编程 IDE 和 Agent 工具价格与功能，涵盖 10+ 工具" />
  <meta property="og:url" content="https://x-plan.pages.dev/ide" />
  <link rel="canonical" href="https://x-plan.pages.dev/ide" />
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
  <!-- 页面标题 -->
  <div class="hero-block">
    <h1>AI IDE / Agent 工具对比</h1>
    <p>对比 AI 编程 IDE、Agent 工具和 VS Code 插件的价格与功能 | <a href="/">← 返回 API 套餐对比</a></p>
  </div>

  <!-- 筛选 -->
  <IDEPlatformFilters onFilterChange={handleFilterChange} />

  <!-- 加载状态 -->
  {#if loading}
    <div class="py-16 text-center">
      <div class="animate-spin inline-block w-8 h-8 border-3 rounded-full" style="border-color: var(--brand); border-top-color: transparent;"></div>
      <p class="mt-4" style="color: var(--text-soft);">加载中...</p>
    </div>
  {:else}
    <!-- IDE 平台对比表格 -->
    <IDEPlatformTable {platforms} />
  {/if}
</div>
