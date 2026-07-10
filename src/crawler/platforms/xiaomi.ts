import { BaseLightCrawler } from '../light/index';
import type { CrawledPlatform } from '../shared/types';

/**
 * 小米 Coding Plan 爬虫
 * 来源: https://xiaomi.com/coding-plan
 */
export class XiaomiCrawler extends BaseLightCrawler {
  slug = 'xiaomi';
  name = '小米';
  sourceUrl = 'https://xiaomi.com/coding-plan';

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

    const entryPrice = foundPrices[0] || 29;

    return {
      platform: {
        name: '小米',
        slug: 'xiaomi',
        service: 'Coding Plan',
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
        { name: '基础版', limit_short: '基础额度', price: entryPrice, description: null, sort_order: 0 },
      ],
      models: [
        { name: 'MiLM-Pro', sort_order: 0 },
      ],
      tools: [],
      tags: [{ tag: '次数计费' }],
      rules: [],
      remarks: [{ content: '小米 Coding Plan' }],
    };
  }
}
