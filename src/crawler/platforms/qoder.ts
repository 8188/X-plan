import { BaseLightCrawler } from '../light/index';
import type { CrawledPlatform } from '../shared/types';

/**
 * Qoder International 爬虫
 * 来源: https://qoder.com/pricing
 */
export class QoderCrawler extends BaseLightCrawler {
  slug = 'qoder';
  name = 'Qoder';
  sourceUrl = 'https://qoder.com/pricing';

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

    const proPrice = foundPrices.find(p => p <= 30) || 20;

    return {
      platform: {
        name: 'Qoder',
        slug: 'qoder',
        service: 'Qoder (International)',
        category: 'other',
        billing_unit: 'request_count',
        platform_type: 'ide',
        accessibility: 'foreign_accessible',
        entry_price: proPrice * 7.2,
        limit_desc: `Pro $${proPrice}/月`,
        source_url: this.sourceUrl,
        last_verified: new Date().toISOString(),
        status: 'active',
      },
      tiers: [
        { name: 'Community', limit_short: '有限试用', price: 0, description: '免费版', sort_order: 0 },
        { name: 'Pro', limit_short: '2,000 Credits/月', price: proPrice * 7.2, description: null, sort_order: 1 },
      ],
      models: [
        { name: 'Claude Sonnet 4', sort_order: 0 },
        { name: 'GPT-4o', sort_order: 1 },
      ],
      tools: [
        { name: '代码补全', sort_order: 0 },
        { name: '代码对话', sort_order: 1 },
        { name: 'Agent 模式', sort_order: 2 },
      ],
      tags: [{ tag: 'IDE插件' }, { tag: 'Agent' }],
      rules: [],
      remarks: [{ content: 'Qoder International，Pro $20/月起' }],
    };
  }
}
