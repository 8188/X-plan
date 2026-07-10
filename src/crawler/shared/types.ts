// 爬虫抓取的原始平台数据
export interface CrawledPlatform {
  platform: {
    name: string;
    slug: string;
    service: string;
    category: 'major' | 'other';
    billing_unit: 'api_request' | 'token' | 'points' | 'request_count' | 'usage_based';
    platform_type: 'api' | 'ide';
    accessibility: 'domestic' | 'foreign_accessible' | 'foreign_blocked';
    entry_price: number;
    limit_desc: string;
    source_url: string | null;
    last_verified: string;
    status: 'active' | 'outdated' | 'offline';
    need_rush?: boolean;
  };
  tiers: Array<{
    name: string;
    limit_short: string | null;
    price: number | null;
    description: string | null;
    sort_order: number;
  }>;
  models: Array<{
    name: string;
    sort_order: number;
  }>;
  tools: Array<{
    name: string;
    sort_order: number;
  }>;
  tags: Array<{
    tag: string;
  }>;
  rules: Array<{
    content: string;
    sort_order: number;
  }>;
  remarks: Array<{
    content: string;
  }>;
  source_urls?: Array<{
    url: string;
    label: string | null;
    sort_order: number;
  }>;
}

// 爬虫结果
export interface CrawlResult {
  success: boolean;
  slug: string;
  data?: CrawledPlatform;
  error?: string;
  /** 如果爬取失败但使用了 baseline 数据，标记为 fallback */
  fallback?: boolean;
}
