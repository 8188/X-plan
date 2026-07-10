-- 平台表
CREATE TABLE platforms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,           -- 平台名称，如"腾讯云"
  slug TEXT UNIQUE NOT NULL,
  service TEXT NOT NULL,        -- 产品名，如"Hy Token Plan"
  category TEXT NOT NULL,       -- "major" | "other"
  billing_unit TEXT NOT NULL,   -- "api_request" | "token" | "points" | "request_count" | "usage_based"
  entry_price REAL NOT NULL,    -- 入门月价 (元)
  limit_desc TEXT NOT NULL,     -- 限额合并描述 (如 "1,200次/5h · 18,000次/月")
  source_url TEXT,              -- 数据来源URL
  last_verified TEXT,           -- 最后验证时间 ISO
  status TEXT DEFAULT 'active', -- "active" | "outdated" | "offline"
  need_rush INTEGER DEFAULT 0,  -- 是否需要抢购 (0=否, 1=是)
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- 套餐档位表
CREATE TABLE tiers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  platform_id INTEGER NOT NULL REFERENCES platforms(id),
  name TEXT NOT NULL,           -- 如 "Lite", "Pro", "Max"
  limit_short TEXT,             -- 限额简写 (如 "2,000/7,000/20,000 AFP")
  price REAL,
  description TEXT,             -- 档位说明
  sort_order INTEGER DEFAULT 0
);

-- 模型表
CREATE TABLE models (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  platform_id INTEGER NOT NULL REFERENCES platforms(id),
  name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

-- 工具表
CREATE TABLE tools (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  platform_id INTEGER NOT NULL REFERENCES platforms(id),
  name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

-- 标签表
CREATE TABLE tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  platform_id INTEGER NOT NULL REFERENCES platforms(id),
  tag TEXT NOT NULL
);

-- 特殊规则/注意事项
CREATE TABLE rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  platform_id INTEGER NOT NULL REFERENCES platforms(id),
  content TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

-- 备注
CREATE TABLE remarks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  platform_id INTEGER NOT NULL REFERENCES platforms(id),
  content TEXT NOT NULL
);

-- 多个数据来源URL
CREATE TABLE source_urls (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  platform_id INTEGER NOT NULL REFERENCES platforms(id),
  url TEXT NOT NULL,
  label TEXT,
  sort_order INTEGER DEFAULT 0
);

-- 站点配置
CREATE TABLE site_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- FAQ
CREATE TABLE faq (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

-- 索引
CREATE INDEX idx_platforms_slug ON platforms(slug);
CREATE INDEX idx_platforms_category ON platforms(category);
CREATE INDEX idx_platforms_status ON platforms(status);
CREATE INDEX idx_platforms_billing_unit ON platforms(billing_unit);
CREATE INDEX idx_tiers_platform_id ON tiers(platform_id);
CREATE INDEX idx_models_platform_id ON models(platform_id);
CREATE INDEX idx_tools_platform_id ON tools(platform_id);
CREATE INDEX idx_tags_platform_id ON tags(platform_id);
CREATE INDEX idx_rules_platform_id ON rules(platform_id);
CREATE INDEX idx_remarks_platform_id ON remarks(platform_id);
CREATE INDEX idx_source_urls_platform_id ON source_urls(platform_id);
