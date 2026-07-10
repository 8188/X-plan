import { BaseLightCrawler } from '../light/index';
import type { CrawledPlatform } from '../shared/types';

/**
 * Trae (字节跳动) 爬虫
 * 来源: https://www.trae.ai/pricing
 */
export class TraeCrawler extends BaseLightCrawler {
  slug = 'trae';
  name = 'Trae';
  sourceUrl = 'https://www.trae.ai/pricing';

  parse(html: string): Partial<CrawledPlatform> {
    const $ = this.loadHtml(html);
    const bodyText = $('body').text();

    const pricePattern = /\$(\d+)\s*\/?\s*month/gi;
    const foundPrices: number[] = [];
    let match;
    while ((match = pricePattern.exec(bodyText)) !== null) {
      const p = parseInt(match[1]);
      if (!foundPrices.includes(p) && p > 0) foundPrices.push(p);
    }

    const litePrice = foundPrices.find(p => p <= 5) || 3;
    const proPrice = foundPrices.find(p => p > 5 && p <= 20) || 10;

    return {
      platform: {
        name: 'Trae',
        slug: 'trae',
        service: 'Trae (字节跳动)',
        category: 'other',
        billing_unit: 'request_count',
        platform_type: 'ide',
        accessibility: 'domestic',
        entry_price: litePrice * 7.2,
        limit_desc: `Lite $${litePrice}/月起`,
        source_url: this.sourceUrl,
        last_verified: new Date().toISOString(),
        status: 'active',
      },
      tiers: [
        { name: 'Free', limit_short: '有限用量', price: 0, description: '免费版', sort_order: 0 },
        { name: 'Lite', limit_short: `$${litePrice}用量/月`, price: litePrice * 7.2, description: null, sort_order: 1 },
        { name: 'Pro', limit_short: `$${proPrice}用量/月`, price: proPrice * 7.2, description: null, sort_order: 2 },
      ],
      models: [
        { name: 'Claude Sonnet 4', sort_order: 0 },
        { name: 'GPT-4o', sort_order: 1 },
        { name: 'Doubao-Pro', sort_order: 2 },
      ],
      tools: [
        { name: '代码补全', sort_order: 0 },
        { name: '代码对话', sort_order: 1 },
        { name: 'Agent 模式', sort_order: 2 },
      ],
      tags: [{ tag: 'IDE' }, { tag: 'Agent' }],
      rules: [],
      remarks: [{ content: 'Trae 字节跳动 AI IDE' }],
    };
  }
}
