-- 添加 source_urls 表，支持一个平台有多个数据来源URL
CREATE TABLE IF NOT EXISTS source_urls (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  platform_id INTEGER NOT NULL REFERENCES platforms(id),
  url TEXT NOT NULL,
  label TEXT,
  sort_order INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_source_urls_platform_id ON source_urls(platform_id);
