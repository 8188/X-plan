import { BaseLightCrawler } from '../light/index';
import type { CrawledPlatform } from '../shared/types';

/**
 * Infini AI 爬虫
 * 来源: https://infini-ai.com/coding
 */
export class InfiniAiCrawler extends BaseLightCrawler {
  slug = 'infini-ai';
  name = 'Infini AI';
  sourceUrl = 'https://infini-ai.com/coding';

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

    const entryPrice = foundPrices[0] || 39;

    return {
      platform: {
        name: 'Infini AI',
        slug: 'infini-ai',
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
        { name: 'Infini-Model', sort_order: 0 },
      ],
      tools: [],
      tags: [{ tag: '次数计费' }],
      rules: [],
      remarks: [{ content: 'Infini AI Coding Plan' }],
    };
  }
}
