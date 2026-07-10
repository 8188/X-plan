import type { CrawledPlatform, CrawlResult } from '../shared/types';
import { normalizePlatform } from '../shared/normalizer';

export interface HeavyCrawler {
  slug: string;
  name: string;
  crawl(): Promise<CrawlResult>;
}

/**
 * 通用重量爬虫基类
 * 使用 Playwright 抓取需要 JS 渲染的页面
 * 注意：Playwright 需要在 VPS 环境中运行，不能在 CF Workers 中运行
 */
export abstract class BaseHeavyCrawler implements HeavyCrawler {
  abstract slug: string;
  abstract name: string;
  abstract sourceUrl: string;

  protected async getPageContent(url: string): Promise<string> {
    // 动态导入 playwright，因为它是可选依赖
    const { chromium } = await import('playwright');
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    try {
      await page.goto(url, { waitUntil: 'networkidle' });
      // 等待页面渲染完成，子类可覆盖
      await page.waitForTimeout(3000);
      return await page.content();
    } finally {
      await browser.close();
    }
  }

  abstract parse(html: string): Partial<CrawledPlatform>;

  async crawl(): Promise<CrawlResult> {
    try {
      const html = await this.getPageContent(this.sourceUrl);
      const rawData = this.parse(html);
      const data = normalizePlatform(rawData);
      
      data.platform.slug = this.slug;
      data.platform.source_url = this.sourceUrl;
      
      return { success: true, slug: this.slug, data };
    } catch (error) {
      return { success: false, slug: this.slug, error: String(error) };
    }
  }
}

/**
 * 运行所有重量爬虫
 */
export async function runHeavyCrawlers(crawlers: HeavyCrawler[]): Promise<CrawlResult[]> {
  const results: CrawlResult[] = [];
  
  for (const crawler of crawlers) {
    console.log(`[Heavy] Crawling ${crawler.name}...`);
    const result = await crawler.crawl();
    results.push(result);
    console.log(`[Heavy] ${crawler.name}: ${result.success ? 'OK' : `FAILED - ${result.error}`}`);
    
    // 更长的延迟
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  
  return results;
}
