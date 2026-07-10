import { BaseLightCrawler } from '../light/index';
import type { CrawledPlatform } from '../shared/types';

/**
 * Windsurf 定价爬虫
 * 来源: https://windsurf.com/pricing
 */
export class WindsurfCrawler extends BaseLightCrawler {
  slug = 'windsurf';
  name = 'Windsurf';
  sourceUrl = 'https://windsurf.com/pricing';

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

    const proPrice = foundPrices.find(p => p <= 20) || 15;
    const teamPrice = foundPrices.find(p => p > 20 && p <= 50) || 35;

    return {
      platform: {
        name: 'Windsurf',
        slug: 'windsurf',
        service: 'Windsurf Pro/Team',
        category: 'other',
        billing_unit: 'request_count',
        platform_type: 'ide',
        accessibility: 'foreign_accessible',
        entry_price: proPrice,
        limit_desc: `$${proPrice}/月`,
        source_url: this.sourceUrl,
        last_verified: new Date().toISOString(),
        status: 'active',
      },
      tiers: [
        { name: 'Pro', limit_short: '标准额度/月', price: proPrice, description: null, sort_order: 0 },
        { name: 'Team', limit_short: '团队额度/月', price: teamPrice, description: null, sort_order: 1 },
      ],
      models: [
        { name: 'Claude Sonnet 4', sort_order: 0 },
        { name: 'GPT-4o', sort_order: 1 },
      ],
      tools: [{ name: 'IDE', sort_order: 0 }],
      tags: [{ tag: '次数计费' }],
      rules: [],
      remarks: [],
    };
  }
}
