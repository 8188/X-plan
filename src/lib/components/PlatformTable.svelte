<script lang="ts">
  import { slide } from 'svelte/transition';
  import PlatformDetail from './PlatformDetail.svelte';
  import type { Platform, PlatformDetail as PlatformDetailType } from '$lib/db/types';
  import { getPlatformIcon, getPlatformInitial } from '$lib/icons';

  let { platforms }: { platforms: Platform[] } = $props();
  let expandedSlug = $state<string | null>(null);
  let detailCache = $state<Record<string, PlatformDetailType>>({});
  let loadingDetail = $state<string | null>(null);

  async function toggleExpand(slug: string) {
    if (expandedSlug === slug) {
      expandedSlug = null;
      return;
    }
    expandedSlug = slug;
    
    if (!detailCache[slug]) {
      loadingDetail = slug;
      try {
        const res = await fetch(`/api/platforms/${slug}`);
        if (res.ok) {
          detailCache[slug] = await res.json();
        }
      } catch (e) {
        console.error('Failed to load platform detail:', e);
      }
      loadingDetail = null;
    }
  }

  function getAccessibilityBadge(accessibility: string): string {
    const badges: Record<string, string> = {
      domestic: '',
      foreign_accessible: '🌍',
      foreign_blocked: '🔒',
    };
    return badges[accessibility] || '';
  }

  function getAccessibilityLabel(accessibility: string): string {
    const labels: Record<string, string> = {
      domestic: '国内',
      foreign_accessible: '国外可访问',
      foreign_blocked: '国外无法访问',
    };
    return labels[accessibility] || accessibility;
  }

  function getBillingUnitLabel(unit: string): string {
    const labels: Record<string, string> = {
      token: 'Token',
      request_count: '次数',
    };
    return labels[unit] || '次数';
  }

  function getBillingUnitColor(unit: string): string {
    const colors: Record<string, string> = {
      token: 'badge-token',
      request_count: 'badge-request',
    };
    return colors[unit] || 'badge-request';
  }

  function formatEntryPrice(price: number | null): string {
    if (price === null || price === undefined) return '-';
    if (price === 0) return '免费';
    return `¥${price}`;
  }
</script>

<!-- 桌面端表格视图 -->
<div class="hidden md:block panel-card overflow-hidden">
  <div class="overflow-x-auto">
    <table class="neon-table">
      <thead>
        <tr>
          <th class="text-left">平台</th>
          <th class="text-center">地区</th>
          <th class="text-center">抢购</th>
          <th class="text-right">入门价</th>
          <th class="text-center">计费方式</th>
          <th class="text-left">限额</th>
        </tr>
      </thead>
      <tbody>
        {#each platforms as platform (platform.slug)}
          <tr onclick={() => toggleExpand(platform.slug)}>
            <td>
              <div class="flex items-center gap-1.5">
                {#if getPlatformIcon(platform.slug)}
                  <img src={getPlatformIcon(platform.slug)} alt="" class="w-4 h-4 rounded-sm shrink-0" loading="lazy" onerror={(e) => {(e.target as HTMLImageElement).style.display='none'}} />
                {:else}
                  <span class="inline-flex items-center justify-center w-4 h-4 rounded-sm text-[10px] font-bold shrink-0" style="background: rgba(89, 126, 158, 0.2); color: var(--text-soft);">{getPlatformInitial(platform.name)}</span>
                {/if}
                {#if platform.source_url}
                  <a
                    href={platform.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="font-medium no-underline"
                    style="color: var(--brand);"
                    onclick={(e) => e.stopPropagation()}
                  >
                    {platform.name}
                  </a>
                {:else}
                  <span class="font-medium">{platform.name}</span>
                {/if}
                <span style="color: var(--text-soft);">{platform.service}</span>
                <span style="color: var(--text-soft);">{expandedSlug === platform.slug ? '▼' : '▶'}</span>
              </div>
            </td>
            <td class="text-center">
              <span class="badge {platform.accessibility === 'domestic' ? 'badge-domestic' : 'badge-foreign'}">
                {getAccessibilityLabel(platform.accessibility)}
              </span>
            </td>
            <td class="text-center">
              {#if platform.need_rush}
                <span class="badge badge-rush">需抢购</span>
              {:else}
                <span style="color: rgba(89, 126, 158, 0.3);">-</span>
              {/if}
            </td>
            <td class="text-right font-semibold" style="color: {platform.entry_price === 0 ? 'var(--brand-2)' : 'var(--text)'};">
              {formatEntryPrice(platform.entry_price)}
            </td>
            <td class="text-center">
              <span class="badge {getBillingUnitColor(platform.billing_unit)}">
                {getBillingUnitLabel(platform.billing_unit)}
              </span>
            </td>
            <td style="color: var(--text-soft); max-width: 200px;" class="truncate">
              {platform.limit_desc}
            </td>
          </tr>
          {#if expandedSlug === platform.slug}
            <tr>
              <td colspan="6" class="px-3 py-0" style="border-top: none;">
                <div transition:slide={{ duration: 300 }}>
                  {#if loadingDetail === platform.slug}
                    <div class="py-6 text-center" style="color: var(--text-soft);">
                      <div class="animate-spin inline-block w-5 h-5 border-2 rounded-full" style="border-color: var(--brand); border-top-color: transparent;"></div>
                      <p class="mt-1 text-xs">加载中...</p>
                    </div>
                  {:else if detailCache[platform.slug]}
                    <PlatformDetail detail={detailCache[platform.slug]} />
                  {:else}
                    <div class="py-3 text-center text-xs" style="color: var(--text-soft);">加载失败</div>
                  {/if}
                </div>
              </td>
            </tr>
          {/if}
        {/each}
      </tbody>
    </table>
  </div>

  {#if platforms.length === 0}
    <div class="py-10 text-center" style="color: var(--text-soft);">
      <p class="text-sm">暂无匹配的平台</p>
      <p class="text-xs mt-1">请尝试调整筛选条件</p>
    </div>
  {/if}
</div>

<!-- 移动端卡片视图 -->
<div class="md:hidden space-y-3">
  {#each platforms as platform (platform.slug)}
    <div class="panel-card overflow-hidden">
      <button
        class="w-full p-3 text-left"
        onclick={() => toggleExpand(platform.slug)}
      >
        <div class="flex items-center justify-between mb-1">
          <div class="flex items-center gap-1.5">
            {#if getPlatformIcon(platform.slug)}
              <img src={getPlatformIcon(platform.slug)} alt="" class="w-4 h-4 rounded-sm shrink-0" loading="lazy" onerror={(e) => {(e.target as HTMLImageElement).style.display='none'}} />
            {:else}
              <span class="inline-flex items-center justify-center w-4 h-4 rounded-sm text-[10px] font-bold shrink-0" style="background: rgba(89, 126, 158, 0.2); color: var(--text-soft);">{getPlatformInitial(platform.name)}</span>
            {/if}
            {#if platform.source_url}
              <a
                href={platform.source_url}
                target="_blank"
                rel="noopener noreferrer"
                class="font-medium text-sm no-underline"
                style="color: var(--brand);"
                onclick={(e) => e.stopPropagation()}
              >
                {platform.name}
              </a>
            {:else}
              <span class="font-medium text-sm">{platform.name}</span>
            {/if}
            {#if platform.need_rush}
              <span class="badge badge-rush">需抢购</span>
            {/if}
            <span class="text-xs" title={getAccessibilityLabel(platform.accessibility)}>{getAccessibilityBadge(platform.accessibility)}</span>
          </div>
          <span class="text-xs" style="color: var(--text-soft);">{expandedSlug === platform.slug ? '▼' : '▶'}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="badge {getBillingUnitColor(platform.billing_unit)}">
            {getBillingUnitLabel(platform.billing_unit)}
          </span>
          <span class="font-semibold text-sm" style="color: {platform.entry_price === 0 ? 'var(--brand-2)' : 'var(--text)'};">
            {formatEntryPrice(platform.entry_price)}
          </span>
        </div>
        <div class="mt-1 text-xs truncate" style="color: var(--text-soft);">
          {platform.limit_desc}
        </div>
      </button>

      {#if expandedSlug === platform.slug}
        <div transition:slide={{ duration: 300 }} style="border-top: 1px solid var(--line);">
          {#if loadingDetail === platform.slug}
            <div class="py-6 text-center" style="color: var(--text-soft);">
              <div class="animate-spin inline-block w-5 h-5 border-2 rounded-full" style="border-color: var(--brand); border-top-color: transparent;"></div>
            </div>
          {:else if detailCache[platform.slug]}
            <PlatformDetail detail={detailCache[platform.slug]} />
          {/if}
        </div>
      {/if}
    </div>
  {/each}

  {#if platforms.length === 0}
    <div class="py-12 text-center" style="color: var(--text-soft);">
      <p class="text-lg">暂无匹配的平台</p>
      <p class="text-sm mt-1">请尝试调整筛选条件</p>
    </div>
  {/if}
</div>
