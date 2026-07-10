<script lang="ts">
  import type { PlatformDetail as PlatformDetailType } from '$lib/db/types';

  let { detail }: { detail: PlatformDetailType } = $props();

  function formatPrice(price: number | null): string {
    if (price === null || price === undefined) return '定制';
    if (price === 0) return '免费';
    return `¥${price}`;
  }
  function priceColor(price: number | null): string {
    if (price === null || price === undefined) return 'color: #fb923c;';
    if (price === 0) return 'color: var(--brand-2);';
    return 'color: var(--brand);';
  }
</script>

<div class="py-2 px-1">
  <!-- 套餐档位 -->
  {#if detail.tiers.length > 0}
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
      {#each detail.tiers as tier}
        <div class="tier-card">
          <div class="flex items-center justify-between mb-0.5">
            <span class="font-medium text-xs leading-tight" style="color: var(--text);">{tier.name}</span>
            <span class="font-bold text-xs whitespace-nowrap ml-1" style={priceColor(tier.price)}>
              {formatPrice(tier.price)}
            </span>
          </div>
          {#if tier.limit_short}
            <p class="text-[11px] leading-tight" style="color: var(--text-soft);">{tier.limit_short}</p>
          {/if}
          {#if tier.description}
            <p class="text-[10px] mt-0.5 leading-tight" style="color: rgba(145, 169, 188, 0.6);">{tier.description}</p>
          {/if}
        </div>
      {/each}
    </div>
  {/if}

  <!-- 数据来源链接 -->
  {#if (detail.source_urls && detail.source_urls.length > 0) || detail.source_url}
    <div class="mt-2 pt-2 flex flex-wrap gap-x-3 gap-y-0.5" style="border-top: 1px solid rgba(89, 126, 158, 0.2);">
      {#if detail.source_urls && detail.source_urls.length > 0}
        {#each detail.source_urls as su}
          <a
            href={su.url}
            target="_blank"
            rel="noopener noreferrer"
            class="text-[11px] no-underline"
            style="color: var(--brand);"
          >
            🔗 {su.label || '套餐页面'} →
          </a>
        {/each}
      {:else if detail.source_url}
        <a
          href={detail.source_url}
          target="_blank"
          rel="noopener noreferrer"
          class="text-[11px] no-underline"
          style="color: var(--brand);"
        >
          🔗 数据来源 →
        </a>
      {/if}
      {#if detail.last_verified}
        <span class="text-[10px]" style="color: rgba(145, 169, 188, 0.5);">
          验证:{new Date(detail.last_verified).toLocaleDateString('zh-CN')}
        </span>
      {/if}
    </div>
  {/if}
</div>
