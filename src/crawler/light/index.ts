import * as cheerio from 'cheerio';
import type { CrawledPlatform, CrawlResult } from '../shared/types';
import { normalizePlatform } from '../shared/normalizer';

export interface LightCrawler {
  slug: string;
  name: string;
  crawl(): Promise<CrawlResult>;
}

/**
 * 通用轻量爬虫基类
 * 使用 fetch + cheerio 抓取页面
 * 
 * 设计思路：爬虫以 seed 数据为基准（baseline），只覆盖能从页面提取的动态字段
 * 子类实现 parse() 返回需要更新的字段，crawl() 会将其合并到 baseline 上
 */
export abstract class BaseLightCrawler implements LightCrawler {
  abstract slug: string;
  abstract name: string;
  abstract sourceUrl: string;

  /** seed 数据作为基准，由 crawl() 自动注入 */
  protected baseline: CrawledPlatform | null = null;

  /** 设置 seed 基准数据 */
  setBaseline(data: CrawledPlatform): void {
    this.baseline = data;
  }

  protected async fetchPage(url: string): Promise<string> {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.text();
  }

  protected loadHtml(html: string): cheerio.CheerioAPI {
    return cheerio.load(html);
  }

  /**
   * 子类实现：从 HTML 中提取需要更新的动态字段
   * 返回 Partial<CrawledPlatform>，只包含需要覆盖的字段
   * 如果爬取失败或无法提取有效数据，返回空对象 {}
   */
  abstract parse(html: string): Partial<CrawledPlatform>;

  /**
   * 静态元数据字段：这些字段由 seed/baseline 定义，不应被爬虫覆盖
   * 爬虫的 parse() 可能返回这些字段（作为 fallback），但 baseline 存在时优先使用 baseline
   */
  private static readonly BASELINE_ONLY_FIELDS = new Set([
    'name', 'service', 'category', 'billing_unit', 'platform_type', 'accessibility',
    'entry_price', 'limit_desc',
  ]);

  /**
   * 将爬取结果合并到 baseline 上
   * 策略：baseline 为基础，parse() 返回的字段覆盖 baseline
   * 对于静态元数据字段（name, service, category 等）：baseline 优先，爬虫不覆盖
   * 对于数组字段（tiers, models, tools, tags, rules, remarks）：
   *   - 如果 parse() 返回了非空数组且长度 >= baseline，则替换 baseline
   *   - 如果 parse() 返回了非空数组但长度 < baseline，说明爬取不完整，保留 baseline
   *   - 如果 parse() 返回空数组或未返回，则保留 baseline
   * 对于其他 platform 标量字段：
   *   - 只覆盖非空/非零值
   */
  protected mergeWithBaseline(crawled: Partial<CrawledPlatform>): CrawledPlatform {
    if (!this.baseline) {
      return normalizePlatform(crawled);
    }

    const base = structuredClone(this.baseline);

    // 覆盖 platform 字段（跳过静态元数据字段，只覆盖有意义的值）
    if (crawled.platform) {
      for (const [key, value] of Object.entries(crawled.platform)) {
        // 静态元数据字段由 baseline 优先，爬虫不覆盖
        if (BaseLightCrawler.BASELINE_ONLY_FIELDS.has(key)) continue;
        if (value !== undefined && value !== null && value !== '' && value !== 0) {
          (base.platform as any)[key] = value;
        }
      }
    }

    // 数组字段：非空且长度 >= baseline 才替换，但做智能合并
    if (crawled.tiers && crawled.tiers.length > 0 && crawled.tiers.length >= base.tiers.length) {
      // 逐 tier 合并：保留 baseline 中有意义的值，price 由 baseline 优先
      for (let i = 0; i < base.tiers.length && i < crawled.tiers.length; i++) {
        const crawledTier = crawled.tiers[i];
        const baseTier = base.tiers[i];
        // 只覆盖非空/非零的字段，但 price 由 baseline 优先（与 entry_price 同理）
        for (const [key, value] of Object.entries(crawledTier)) {
          if (key === 'price') continue; // price 由 baseline 优先
          if (value !== undefined && value !== null && value !== '' && value !== 0) {
            (baseTier as any)[key] = value;
          }
        }
      }
    }
    if (crawled.models && crawled.models.length > 0 && crawled.models.length >= base.models.length) {
      // 逐 model 合并：保留 baseline 中的 model，只补充新 model
      for (let i = 0; i < base.models.length && i < crawled.models.length; i++) {
        const crawledModel = crawled.models[i];
        const baseModel = base.models[i];
        for (const [key, value] of Object.entries(crawledModel)) {
          if (value !== undefined && value !== null && value !== '' && value !== 0) {
            (baseModel as any)[key] = value;
          }
        }
      }
    }
    if (crawled.tools && crawled.tools.length > 0 && crawled.tools.length >= base.tools.length) base.tools = crawled.tools;
    if (crawled.tags && crawled.tags.length > 0 && crawled.tags.length >= base.tags.length) base.tags = crawled.tags;
    if (crawled.rules && crawled.rules.length > 0 && crawled.rules.length >= base.rules.length) base.rules = crawled.rules;
    if (crawled.remarks && crawled.remarks.length > 0 && crawled.remarks.length >= base.remarks.length) base.remarks = crawled.remarks;
    if (crawled.source_urls && crawled.source_urls.length > 0 && crawled.source_urls.length >= (base.source_urls?.length || 0)) base.source_urls = crawled.source_urls;

    return base;
  }

  async crawl(): Promise<CrawlResult> {
    try {
      const html = await this.fetchPage(this.sourceUrl);
      const parsed = this.parse(html);
      const data = this.mergeWithBaseline(parsed);
      
      // 确保 slug 和 source_url 正确
      data.platform.slug = this.slug;
      data.platform.source_url = this.sourceUrl;
      // 更新验证时间
      data.platform.last_verified = new Date().toISOString();
      
      return { success: true, slug: this.slug, data };
    } catch (error) {
      // 如果爬取失败但有 baseline，返回 baseline 数据（标记为 fallback）
      if (this.baseline) {
        const data = structuredClone(this.baseline);
        data.platform.slug = this.slug;
        data.platform.source_url = this.sourceUrl;
        data.platform.last_verified = new Date().toISOString();
        return { success: true, slug: this.slug, data, fallback: true };
      }
      return { success: false, slug: this.slug, error: String(error) };
    }
  }
}

/**
 * 运行所有轻量爬虫
 */
export async function runLightCrawlers(crawlers: LightCrawler[]): Promise<CrawlResult[]> {
  const results: CrawlResult[] = [];
  
  for (const crawler of crawlers) {
    console.log(`[Light] Crawling ${crawler.name}...`);
    const result = await crawler.crawl();
    results.push(result);
    console.log(`[Light] ${crawler.name}: ${result.success ? (result.fallback ? 'OK (fallback)' : 'OK') : `FAILED - ${result.error}`}`);
    
    // 礼貌延迟，避免被封
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  return results;
}
