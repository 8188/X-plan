import { BaseLightCrawler } from '../light/index';
import type { CrawledPlatform } from '../shared/types';

/**
 * 华为云码道 CodeArts 爬虫
 * 来源: https://codearts.huaweicloud.com/pricing.html
 */
export class HuaweiCloudCrawler extends BaseLightCrawler {
  slug = 'huawei-cloud';
  name = '华为云';
  sourceUrl = 'https://codearts.huaweicloud.com/pricing.html';

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

    const entryPrice = foundPrices[0] || 28;

    return {
      platform: {
        name: '华为云',
        slug: 'huawei-cloud',
        service: 'Token Plan',
        category: 'major',
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
        { name: 'Lite', limit_short: '基础额度', price: entryPrice, description: null, sort_order: 0 },
      ],
      models: [
        { name: 'Claude Sonnet 4', sort_order: 0 },
        { name: 'DeepSeek-R1', sort_order: 1 },
        { name: 'Qwen-Max', sort_order: 2 },
      ],
      tools: [],
      tags: [{ tag: '大厂' }, { tag: 'Token计费' }],
      rules: [],
      remarks: [{ content: '华为云 Token Plan，支持多种模型' }],
    };
  }
}
