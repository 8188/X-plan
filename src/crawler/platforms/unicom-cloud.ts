import { BaseLightCrawler } from '../light/index';
import type { CrawledPlatform } from '../shared/types';

/**
 * 联通云元景 Token Plan 爬虫
 * 来源: https://www.cucloud.cn/product/tokenplan.html
 */
export class UnicomCloudCrawler extends BaseLightCrawler {
  slug = 'unicom-cloud';
  name = '联通云';
  sourceUrl = 'https://www.cucloud.cn/product/tokenplan.html';

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
        name: '联通云',
        slug: 'unicom-cloud',
        service: 'Token Plan',
        category: 'other',
        billing_unit: 'token',
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
        { name: 'DeepSeek-R1', sort_order: 0 },
        { name: 'Qwen-Max', sort_order: 1 },
      ],
      tools: [],
      tags: [{ tag: 'Token计费' }],
      rules: [],
      remarks: [{ content: '联通云 Token Plan' }],
    };
  }
}
