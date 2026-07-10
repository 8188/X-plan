import { BaseLightCrawler } from '../light/index';
import type { CrawledPlatform } from '../shared/types';

/**
 * UCloud 优刻得 Coding Plan 爬虫
 * 来源: https://www.compshare.cn/coding-plan
 */
export class UcloudCrawler extends BaseLightCrawler {
  slug = 'ucloud';
  name = 'UCloud 优刻得';
  sourceUrl = 'https://www.compshare.cn/coding-plan';

  parse(html: string): Partial<CrawledPlatform> {
    const $ = this.loadHtml(html);
    const bodyText = $('body').text();

    const pricePattern = /¥(\d+)\s*\/?\s*月/g;
    const foundPrices: number[] = [];
    let match;
    while ((match = pricePattern.exec(bodyText)) !== null) {
      const p = parseInt(match[1]);
      if (!foundPrices.includes(p) && p > 0) foundPrices.push(p);
    }

    const entryPrice = foundPrices[0] || 49;

    return {
      platform: {
        name: 'UCloud 优刻得',
        slug: 'ucloud',
        service: '优云智算 Coding Plan',
        category: 'other',
        billing_unit: 'request_count',
        platform_type: 'api',
        accessibility: 'domestic',
        entry_price: entryPrice,
        limit_desc: `¥${entryPrice}/月起`,
        source_url: this.sourceUrl,
        last_verified: new Date().toISOString(),
        status: 'active',
      },
      tiers: [
        { name: 'Mini', limit_short: '~300次/5h', price: entryPrice, description: null, sort_order: 0 },
      ],
      models: [
        { name: 'DeepSeek-R1', sort_order: 0 },
        { name: 'Qwen-Max', sort_order: 1 },
      ],
      tools: [],
      tags: [{ tag: '次数计费' }],
      rules: [],
      remarks: [{ content: 'UCloud 优刻得优云智算 Coding Plan' }],
    };
  }
}
