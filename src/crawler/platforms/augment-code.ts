import { BaseLightCrawler } from '../light/index';
import type { CrawledPlatform } from '../shared/types';

/**
 * Augment Code 爬虫
 * 来源: https://www.augmentcode.com/pricing
 */
export class AugmentCodeCrawler extends BaseLightCrawler {
  slug = 'augment-code';
  name = 'Augment Code';
  sourceUrl = 'https://www.augmentcode.com/pricing';

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

    const businessPrice = foundPrices[0] || 100;

    return {
      platform: {
        name: 'Augment Code',
        slug: 'augment-code',
        service: 'Augment Code',
        category: 'other',
        billing_unit: 'request_count',
        platform_type: 'ide',
        accessibility: 'foreign_accessible',
        entry_price: businessPrice * 7.2,
        limit_desc: `Business $${businessPrice}/月`,
        source_url: this.sourceUrl,
        last_verified: new Date().toISOString(),
        status: 'active',
      },
      tiers: [
        { name: 'Business', limit_short: `$${businessPrice}用量/月`, price: businessPrice * 7.2, description: null, sort_order: 0 },
      ],
      models: [
        { name: 'Augment-Model', sort_order: 0 },
      ],
      tools: [
        { name: '代码补全', sort_order: 0 },
        { name: '代码对话', sort_order: 1 },
        { name: 'Agent 模式', sort_order: 2 },
      ],
      tags: [{ tag: 'IDE' }, { tag: 'Agent' }],
      rules: [],
      remarks: [{ content: 'Augment Code，专注代码理解的 AI 助手' }],
    };
  }
}
