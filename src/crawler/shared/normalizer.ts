import type { CrawledPlatform } from './types';

/**
 * 标准化爬虫数据，确保字段格式一致
 */
export function normalizePlatform(data: Partial<CrawledPlatform>): CrawledPlatform {
  return {
    platform: {
      name: data.platform?.name || '',
      slug: data.platform?.slug || '',
      service: data.platform?.service || '',
      category: data.platform?.category || 'other',
      billing_unit: data.platform?.billing_unit || 'api_request',
      platform_type: data.platform?.platform_type || 'api',
      accessibility: data.platform?.accessibility || 'domestic',
      entry_price: data.platform?.entry_price || 0,
      limit_desc: data.platform?.limit_desc || '',
      source_url: data.platform?.source_url || null,
      last_verified: data.platform?.last_verified || new Date().toISOString(),
      status: data.platform?.status || 'active',
      need_rush: data.platform?.need_rush || false,
    },
    tiers: (data.tiers || []).map((t, i) => ({
      name: t.name || '',
      limit_short: t.limit_short ?? null,
      price: t.price || 0,
      description: t.description ?? null,
      sort_order: t.sort_order ?? i,
    })),
    models: (data.models || []).map((m, i) => ({
      name: m.name || '',
      sort_order: m.sort_order ?? i,
    })),
    tools: (data.tools || []).map((t, i) => ({
      name: t.name || '',
      sort_order: t.sort_order ?? i,
    })),
    tags: (data.tags || []),
    rules: (data.rules || []).map((r, i) => ({
      content: r.content || '',
      sort_order: r.sort_order ?? i,
    })),
    remarks: (data.remarks || []),
    source_urls: (data.source_urls || []).map((s, i) => ({
      url: s.url || '',
      label: s.label ?? null,
      sort_order: s.sort_order ?? i,
    })),
  };
}

/**
 * 生成 slug（中文平台名 -> pinyin 或自定义 slug）
 */
export function generateSlug(name: string): string {
  // 简单处理：移除特殊字符，空格转连字符，转小写
  return name
    .toLowerCase()
    .replace(/[^\w\s\u4e00-\u9fff-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}
