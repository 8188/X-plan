export interface Platform {
  id: number;
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
  last_verified: string | null;
  status: 'active' | 'outdated' | 'offline';
  need_rush: boolean;
  created_at: string;
  updated_at: string;
}

export interface Tier {
  id: number;
  platform_id: number;
  name: string;
  limit_short: string | null;
  price: number | null;
  description: string | null;
  sort_order: number;
}

export interface Model {
  id: number;
  platform_id: number;
  name: string;
  sort_order: number;
}

export interface Tool {
  id: number;
  platform_id: number;
  name: string;
  sort_order: number;
}

export interface Tag {
  id: number;
  platform_id: number;
  tag: string;
}

export interface Rule {
  id: number;
  platform_id: number;
  content: string;
  sort_order: number;
}

export interface Remark {
  id: number;
  platform_id: number;
  content: string;
}

export interface SourceUrl {
  id: number;
  platform_id: number;
  url: string;
  label: string | null;
  sort_order: number;
}

export interface SiteConfig {
  key: string;
  value: string;
}

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  sort_order: number;
}

// 平台详情（含关联数据）
export interface PlatformDetail extends Platform {
  tiers: Tier[];
  models: Model[];
  tools: Tool[];
  tags: Tag[];
  rules: Rule[];
  remarks: Remark[];
  source_urls?: SourceUrl[];
}
