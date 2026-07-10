import { BaseLightCrawler } from '../light/index';
import type { CrawledPlatform } from '../shared/types';

/**
 * Cursor 定价爬虫
 * 来源: https://cursor.com/pricing
 */
export class CursorCrawler extends BaseLightCrawler {
  slug = 'cursor';
  name = 'Cursor';
  sourceUrl = 'https://cursor.com/pricing';

  parse(html: string): Partial<CrawledPlatform> {
    const $ = this.loadHtml(html);
    const bodyText = $('body').text();

    // 匹配价格: $20/month, $50/month 等
    const pricePattern = /\$(\d+)\s*\/?\s*month/gi;
    const foundPrices: number[] = [];
    let match;
    while ((match = pricePattern.exec(bodyText)) !== null) {
      const p = parseInt(match[1]);
      if (!foundPrices.includes(p) && p > 0) foundPrices.push(p);
    }

    const litePrice = foundPrices.find(p => p <= 20) || 20;
    const proPrice = foundPrices.find(p => p > 20 && p <= 50) || 50;
    const businessPrice = foundPrices.find(p => p > 50 && p <= 200) || 200;

    return {
      platform: {
        name: 'Cursor',
        slug: 'cursor',
        service: 'Cursor Pro/Business',
        category: 'other',
        billing_unit: 'request_count',
        platform_type: 'ide',
        accessibility: 'foreign_accessible',
        entry_price: litePrice,
        limit_desc: `Lite $${litePrice}/月起`,
        source_url: this.sourceUrl,
        last_verified: new Date().toISOString(),
        status: 'active',
      },
      tiers: [
        { name: 'Lite', limit_short: '500次快速请求/月', price: litePrice, description: null, sort_order: 0 },
        { name: 'Pro', limit_short: '无限快速请求', price: proPrice, description: null, sort_order: 1 },
        { name: 'Business', limit_short: '无限+管理功能', price: businessPrice, description: null, sort_order: 2 },
      ],
      models: [
        { name: 'Claude Sonnet 4', sort_order: 0 },
        { name: 'GPT-4o', sort_order: 1 },
        { name: 'Gemini 2.5 Pro', sort_order: 2 },
      ],
      tools: [{ name: 'IDE', sort_order: 0 }],
      tags: [{ tag: '次数计费' }],
      rules: [],
      remarks: [],
    };
  }
}
