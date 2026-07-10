import { BaseLightCrawler } from '../light/index';
import type { CrawledPlatform } from '../shared/types';

/**
 * 快手 KwaiKAT Coding Plan 爬虫
 * 来源: https://www.streamlake.com/marketing/coding-plan
 */
export class KuaishouCrawler extends BaseLightCrawler {
  slug = 'kuaishou';
  name = '快手';
  sourceUrl = 'https://www.streamlake.com/marketing/coding-plan';

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
        name: '快手',
        slug: 'kuaishou',
        service: 'KwaiKAT Coding Plan',
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
        { name: 'Mini', limit_short: '40 Prompts/5h', price: entryPrice, description: null, sort_order: 0 },
      ],
      models: [
        { name: 'KAT-Coder-Pro V2', sort_order: 0 },
      ],
      tools: [],
      tags: [{ tag: '次数计费' }],
      rules: [
        { content: '5小时流控，滑动步长1小时', sort_order: 0 },
      ],
      remarks: [{ content: '快手 KwaiKAT Coding Plan' }],
    };
  }
}
