import type { D1Database } from '@cloudflare/workers-types';
import type { Platform, PlatformDetail, Tier, Model, Tool, Tag, Rule, Remark, SourceUrl, SiteConfig, FAQ } from './types';

export class DbClient {
  constructor(private db: D1Database) {}

  // 平台相关
  async getPlatforms(options?: {
    category?: string;
    billing_unit?: string;
    platform_type?: string;
    accessibility?: string;
    status?: string;
    search?: string;
    sort?: string;
    order?: 'asc' | 'desc';
  }): Promise<Platform[]> {
    let query = 'SELECT * FROM platforms WHERE 1=1';
    const params: unknown[] = [];

    if (options?.status) {
      query += ' AND status = ?';
      params.push(options.status);
    } else {
      query += " AND status = 'active'";
    }

    if (options?.category) {
      query += ' AND category = ?';
      params.push(options.category);
    }

    if (options?.billing_unit) {
      query += ' AND billing_unit = ?';
      params.push(options.billing_unit);
    }

    if (options?.platform_type) {
      query += ' AND platform_type = ?';
      params.push(options.platform_type);
    }

    if (options?.accessibility) {
      query += ' AND accessibility = ?';
      params.push(options.accessibility);
    }

    if (options?.search) {
      query += ' AND (name LIKE ? OR service LIKE ?)';
      params.push(`%${options.search}%`, `%${options.search}%`);
    }

    const sort = options?.sort || 'entry_price';
    const order = options?.order || 'asc';
    query += ` ORDER BY ${sort} ${order}`;

    return this.db.prepare(query).bind(...params).all().then(r => r.results as unknown as Platform[]);
  }

  async getPlatformBySlug(slug: string): Promise<Platform | null> {
    const result = await this.db.prepare('SELECT * FROM platforms WHERE slug = ?').bind(slug).first();
    return result as Platform | null;
  }

  async getPlatformDetail(slug: string): Promise<PlatformDetail | null> {
    const platform = await this.getPlatformBySlug(slug);
    if (!platform) return null;

    const [tiers, models, tools, tags, rules, remarks, source_urls] = await Promise.all([
      this.db.prepare('SELECT * FROM tiers WHERE platform_id = ? ORDER BY sort_order').bind(platform.id).all().then(r => r.results as unknown as Tier[]),
      this.db.prepare('SELECT * FROM models WHERE platform_id = ? ORDER BY sort_order').bind(platform.id).all().then(r => r.results as unknown as Model[]),
      this.db.prepare('SELECT * FROM tools WHERE platform_id = ? ORDER BY sort_order').bind(platform.id).all().then(r => r.results as unknown as Tool[]),
      this.db.prepare('SELECT * FROM tags WHERE platform_id = ?').bind(platform.id).all().then(r => r.results as unknown as Tag[]),
      this.db.prepare('SELECT * FROM rules WHERE platform_id = ? ORDER BY sort_order').bind(platform.id).all().then(r => r.results as unknown as Rule[]),
      this.db.prepare('SELECT * FROM remarks WHERE platform_id = ?').bind(platform.id).all().then(r => r.results as unknown as Remark[]),
      this.db.prepare('SELECT * FROM source_urls WHERE platform_id = ? ORDER BY sort_order').bind(platform.id).all().then(r => r.results as unknown as SourceUrl[]).catch(() => [] as SourceUrl[]),
    ]);

    return { ...platform, tiers, models, tools, tags, rules, remarks, source_urls };
  }

  // FAQ
  async getFAQs(): Promise<FAQ[]> {
    return this.db.prepare('SELECT * FROM faq ORDER BY sort_order').all().then(r => r.results as unknown as FAQ[]);
  }

  // 站点配置
  async getConfig(key: string): Promise<string | null> {
    const result = await this.db.prepare('SELECT value FROM site_config WHERE key = ?').bind(key).first();
    return (result as any)?.value || null;
  }

  async getAllConfig(): Promise<SiteConfig[]> {
    return this.db.prepare('SELECT * FROM site_config').all().then(r => r.results as unknown as SiteConfig[]);
  }

  // 管理操作
  async upsertPlatform(platform: Omit<Platform, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
    await this.db.prepare(`
      INSERT INTO platforms (name, slug, service, category, billing_unit, platform_type, accessibility, entry_price, limit_desc, source_url, last_verified, status, need_rush)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(slug) DO UPDATE SET
        name = excluded.name,
        service = excluded.service,
        category = excluded.category,
        billing_unit = excluded.billing_unit,
        platform_type = excluded.platform_type,
        accessibility = excluded.accessibility,
        entry_price = excluded.entry_price,
        limit_desc = excluded.limit_desc,
        source_url = excluded.source_url,
        last_verified = excluded.last_verified,
        status = excluded.status,
        need_rush = excluded.need_rush,
        updated_at = datetime('now')
    `).bind(
      platform.name, platform.slug, platform.service, platform.category,
      platform.billing_unit, platform.platform_type, platform.accessibility,
      platform.entry_price, platform.limit_desc,
      platform.source_url, platform.last_verified, platform.status,
      platform.need_rush ? 1 : 0
    ).run();
  }

  async initSchema(): Promise<string[]> {
    const results: string[] = [];
    const statements = [
      `CREATE TABLE IF NOT EXISTS platforms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        service TEXT NOT NULL,
        category TEXT NOT NULL,
        billing_unit TEXT NOT NULL,
        platform_type TEXT NOT NULL DEFAULT 'api',
        accessibility TEXT NOT NULL DEFAULT 'domestic',
        entry_price REAL NOT NULL,
        limit_desc TEXT NOT NULL,
        source_url TEXT,
        last_verified TEXT,
        status TEXT DEFAULT 'active',
        need_rush INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      )`,
      `CREATE TABLE IF NOT EXISTS tiers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        platform_id INTEGER NOT NULL REFERENCES platforms(id),
        name TEXT NOT NULL,
        limit_short TEXT,
        price REAL,
        description TEXT,
        sort_order INTEGER DEFAULT 0
      )`,
      `CREATE TABLE IF NOT EXISTS models (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        platform_id INTEGER NOT NULL REFERENCES platforms(id),
        name TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0
      )`,
      `CREATE TABLE IF NOT EXISTS tools (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        platform_id INTEGER NOT NULL REFERENCES platforms(id),
        name TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0
      )`,
      `CREATE TABLE IF NOT EXISTS tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        platform_id INTEGER NOT NULL REFERENCES platforms(id),
        tag TEXT NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS rules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        platform_id INTEGER NOT NULL REFERENCES platforms(id),
        content TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0
      )`,
      `CREATE TABLE IF NOT EXISTS remarks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        platform_id INTEGER NOT NULL REFERENCES platforms(id),
        content TEXT NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS site_config (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS faq (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0
      )`,
      `CREATE TABLE IF NOT EXISTS source_urls (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        platform_id INTEGER NOT NULL REFERENCES platforms(id),
        url TEXT NOT NULL,
        label TEXT,
        sort_order INTEGER DEFAULT 0
      )`,
      `CREATE INDEX IF NOT EXISTS idx_platforms_slug ON platforms(slug)`,
      `CREATE INDEX IF NOT EXISTS idx_platforms_category ON platforms(category)`,
      `CREATE INDEX IF NOT EXISTS idx_platforms_status ON platforms(status)`,
      `CREATE INDEX IF NOT EXISTS idx_platforms_billing_unit ON platforms(billing_unit)`,
      `CREATE INDEX IF NOT EXISTS idx_tiers_platform_id ON tiers(platform_id)`,
      `CREATE INDEX IF NOT EXISTS idx_models_platform_id ON models(platform_id)`,
      `CREATE INDEX IF NOT EXISTS idx_tools_platform_id ON tools(platform_id)`,
      `CREATE INDEX IF NOT EXISTS idx_tags_platform_id ON tags(platform_id)`,
      `CREATE INDEX IF NOT EXISTS idx_rules_platform_id ON rules(platform_id)`,
      `CREATE INDEX IF NOT EXISTS idx_remarks_platform_id ON remarks(platform_id)`,
      `CREATE INDEX IF NOT EXISTS idx_source_urls_platform_id ON source_urls(platform_id)`,
    ];
    for (const sql of statements) {
      await this.db.prepare(sql).run();
      results.push('OK');
    }
    // Migration: recreate tables without removed columns
    try {
      const tableInfoResult = await this.db.prepare("PRAGMA table_info(platforms)").all();
      const tableInfo = tableInfoResult.results || [];
      const fmpCol = tableInfo.find((c: any) => c.name === 'first_month_price') as any;
      if (fmpCol) {
        // Need to migrate: drop old tables and recreate with new schema
        await this.db.prepare('DROP TABLE IF EXISTS tiers').run();
        await this.db.prepare('DROP TABLE IF EXISTS models').run();
        await this.db.prepare('DROP TABLE IF EXISTS tools').run();
        await this.db.prepare('DROP TABLE IF EXISTS tags').run();
        await this.db.prepare('DROP TABLE IF EXISTS rules').run();
        await this.db.prepare('DROP TABLE IF EXISTS remarks').run();
        await this.db.prepare('DROP TABLE IF EXISTS source_urls').run();
        await this.db.prepare('DROP TABLE IF EXISTS platforms').run();
        // Recreate platforms and tiers with new schema
        await this.db.prepare(`CREATE TABLE platforms (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          slug TEXT UNIQUE NOT NULL,
          service TEXT NOT NULL,
          category TEXT NOT NULL,
          billing_unit TEXT NOT NULL,
          platform_type TEXT NOT NULL DEFAULT 'api',
          accessibility TEXT NOT NULL DEFAULT 'domestic',
          entry_price REAL NOT NULL,
          limit_desc TEXT NOT NULL,
          source_url TEXT,
          last_verified TEXT,
          status TEXT DEFAULT 'active',
          need_rush INTEGER DEFAULT 0,
          created_at TEXT DEFAULT (datetime('now')),
          updated_at TEXT DEFAULT (datetime('now'))
        )`).run();
        await this.db.prepare(`CREATE TABLE tiers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          platform_id INTEGER NOT NULL REFERENCES platforms(id),
          name TEXT NOT NULL,
          limit_short TEXT,
          price REAL,
          description TEXT,
          sort_order INTEGER DEFAULT 0
        )`).run();
        await this.db.prepare('CREATE INDEX idx_platforms_slug ON platforms(slug)').run();
        await this.db.prepare('CREATE INDEX idx_platforms_category ON platforms(category)').run();
        await this.db.prepare('CREATE INDEX idx_platforms_status ON platforms(status)').run();
        await this.db.prepare('CREATE INDEX idx_platforms_billing_unit ON platforms(billing_unit)').run();
        await this.db.prepare('CREATE INDEX idx_tiers_platform_id ON tiers(platform_id)').run();
        // Recreate other related tables
        await this.db.prepare(`CREATE TABLE models (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          platform_id INTEGER NOT NULL REFERENCES platforms(id),
          name TEXT NOT NULL,
          sort_order INTEGER DEFAULT 0
        )`).run();
        await this.db.prepare(`CREATE TABLE tools (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          platform_id INTEGER NOT NULL REFERENCES platforms(id),
          name TEXT NOT NULL,
          sort_order INTEGER DEFAULT 0
        )`).run();
        await this.db.prepare(`CREATE TABLE tags (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          platform_id INTEGER NOT NULL REFERENCES platforms(id),
          tag TEXT NOT NULL,
          sort_order INTEGER DEFAULT 0
        )`).run();
        await this.db.prepare(`CREATE TABLE rules (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          platform_id INTEGER NOT NULL REFERENCES platforms(id),
          content TEXT NOT NULL,
          sort_order INTEGER DEFAULT 0
        )`).run();
        await this.db.prepare(`CREATE TABLE remarks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          platform_id INTEGER NOT NULL REFERENCES platforms(id),
          content TEXT NOT NULL,
          sort_order INTEGER DEFAULT 0
        )`).run();
        await this.db.prepare(`CREATE TABLE source_urls (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          platform_id INTEGER NOT NULL REFERENCES platforms(id),
          url TEXT NOT NULL,
          label TEXT,
          sort_order INTEGER DEFAULT 0
        )`).run();
        await this.db.prepare('CREATE INDEX idx_models_platform_id ON models(platform_id)').run();
        await this.db.prepare('CREATE INDEX idx_tools_platform_id ON tools(platform_id)').run();
        await this.db.prepare('CREATE INDEX idx_tags_platform_id ON tags(platform_id)').run();
        await this.db.prepare('CREATE INDEX idx_rules_platform_id ON rules(platform_id)').run();
        await this.db.prepare('CREATE INDEX idx_remarks_platform_id ON remarks(platform_id)').run();
        await this.db.prepare('CREATE INDEX idx_source_urls_platform_id ON source_urls(platform_id)').run();
        results.push('MIGRATION: removed first_month_price/second_month_price/price_per_unit');
      }
    } catch { /* ignore */ }
    return results;
  }

  async deletePlatformRelated(platformId: number): Promise<void> {
    await Promise.all([
      this.db.prepare('DELETE FROM tiers WHERE platform_id = ?').bind(platformId).run(),
      this.db.prepare('DELETE FROM models WHERE platform_id = ?').bind(platformId).run(),
      this.db.prepare('DELETE FROM tools WHERE platform_id = ?').bind(platformId).run(),
      this.db.prepare('DELETE FROM tags WHERE platform_id = ?').bind(platformId).run(),
      this.db.prepare('DELETE FROM rules WHERE platform_id = ?').bind(platformId).run(),
      this.db.prepare('DELETE FROM remarks WHERE platform_id = ?').bind(platformId).run(),
      this.db.prepare('DELETE FROM source_urls WHERE platform_id = ?').bind(platformId).run().catch(() => {}),
    ]);
  }

  async deletePlatform(platformId: number): Promise<void> {
    await this.db.prepare('DELETE FROM platforms WHERE id = ?').bind(platformId).run();
  }

  async insertTiers(tiers: Omit<Tier, 'id'>[]): Promise<void> {
    for (const tier of tiers) {
      await this.db.prepare(
        'INSERT INTO tiers (platform_id, name, limit_short, price, description, sort_order) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(tier.platform_id, tier.name, tier.limit_short, tier.price, tier.description, tier.sort_order).run();
    }
  }

  async insertModels(models: Omit<Model, 'id'>[]): Promise<void> {
    for (const model of models) {
      await this.db.prepare('INSERT INTO models (platform_id, name, sort_order) VALUES (?, ?, ?)').bind(model.platform_id, model.name, model.sort_order).run();
    }
  }

  async insertTools(tools: Omit<Tool, 'id'>[]): Promise<void> {
    for (const tool of tools) {
      await this.db.prepare('INSERT INTO tools (platform_id, name, sort_order) VALUES (?, ?, ?)').bind(tool.platform_id, tool.name, tool.sort_order).run();
    }
  }

  async insertTags(tags: Omit<Tag, 'id'>[]): Promise<void> {
    for (const tag of tags) {
      await this.db.prepare('INSERT INTO tags (platform_id, tag) VALUES (?, ?)').bind(tag.platform_id, tag.tag).run();
    }
  }

  async insertRules(rules: Omit<Rule, 'id'>[]): Promise<void> {
    for (const rule of rules) {
      await this.db.prepare('INSERT INTO rules (platform_id, content, sort_order) VALUES (?, ?, ?)').bind(rule.platform_id, rule.content, rule.sort_order).run();
    }
  }

  async insertRemarks(remarks: Omit<Remark, 'id'>[]): Promise<void> {
    for (const remark of remarks) {
      await this.db.prepare('INSERT INTO remarks (platform_id, content) VALUES (?, ?)').bind(remark.platform_id, remark.content).run();
    }
  }

  async insertSourceUrls(sourceUrls: Omit<SourceUrl, 'id'>[]): Promise<void> {
    for (const su of sourceUrls) {
      await this.db.prepare(
        'INSERT INTO source_urls (platform_id, url, label, sort_order) VALUES (?, ?, ?, ?)'
      ).bind(su.platform_id, su.url, su.label, su.sort_order).run();
    }
  }
}
