import { BaseLightCrawler } from '../light/index';
import type { CrawledPlatform } from '../shared/types';

/**
 * OpenCode 爬虫
 * 来源: https://opencode.ai/zh/go
 */
export class OpencodeCrawler extends BaseLightCrawler {
  slug = 'opencode';
  name = 'OpenCode';
  sourceUrl = 'https://opencode.ai/zh/go';

  parse(html: string): Partial<CrawledPlatform> {
    const $ = this.loadHtml(html);
    const bodyText = $('body').text();

    // 匹配价格: ¥XX/月
    const pricePattern = /¥(\d+)\s*\/?\s*月/g;
    const foundPrices: number[] = [];
    let match;
    while ((match = pricePattern.exec(bodyText)) !== null) {
      const p = parseInt(match[1]);
      if (!foundPrices.includes(p) && p > 0) foundPrices.push(p);
    }

    const litePrice = foundPrices[0] || 49;
    const proPrice = foundPrices[1] || 149;

    return {
      platform: {
        name: 'OpenCode',
        slug: 'opencode',
        service: 'OpenCode Coding Plan',
        category: 'other',
        billing_unit: 'request_count',
        platform_type: 'api',
        accessibility: 'domestic',
        entry_price: litePrice,
        limit_desc: `¥${litePrice}/月起`,
        source_url: this.sourceUrl,
        last_verified: new Date().toISOString(),
        status: 'active',
      },
      tiers: [
        { name: 'Lite', limit_short: '基础额度/月', price: litePrice, description: null, sort_order: 0 },
        { name: 'Pro', limit_short: '5x Lite额度/月', price: proPrice, description: null, sort_order: 1 },
      ],
      models: [
        { name: 'Claude Sonnet 4', sort_order: 0 },
        { name: 'GPT-4o', sort_order: 1 },
        { name: 'DeepSeek-R1', sort_order: 2 },
      ],
      tools: [
        { name: 'OpenCode', sort_order: 0 },
        { name: 'Cursor', sort_order: 1 },
        { name: 'Cline', sort_order: 2 },
      ],
      tags: [{ tag: '次数计费' }],
      rules: [],
      remarks: [],
    };
  }
}
