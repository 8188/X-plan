import { BaseLightCrawler } from '../light/index';
import type { CrawledPlatform } from '../shared/types';

/**
 * 火山引擎（豆包）爬虫
 * 来源: https://www.volcengine.com/product/doubao
 */
export class VolcengineCrawler extends BaseLightCrawler {
  slug = 'volcengine';
  name = '火山引擎';
  sourceUrl = 'https://www.volcengine.com/product/doubao';

  parse(html: string): Partial<CrawledPlatform> {
    const $ = this.loadHtml(html);
    const bodyText = $('body').text();

    // 匹配 tokens 价格
    const tokenPricePattern = /¥([\d.]+)\s*\/?\s*百万\s*tokens?/gi;
    const foundTokenPrices: number[] = [];
    let match;
    while ((match = tokenPricePattern.exec(bodyText)) !== null) {
      const p = parseFloat(match[1]);
      if (!foundTokenPrices.includes(p) && p > 0) foundTokenPrices.push(p);
    }

    // 匹配包月价格
    const pricePattern = /¥(\d+)\s*\/?\s*月/g;
    const foundPrices: number[] = [];
    while ((match = pricePattern.exec(bodyText)) !== null) {
      const p = parseInt(match[1]);
      if (!foundPrices.includes(p) && p > 0) foundPrices.push(p);
    }

    const entryPrice = foundPrices[0] || 0;

    return {
      platform: {
        name: '火山引擎',
        slug: 'volcengine',
        service: '豆包大模型',
        category: 'other',
        billing_unit: 'token',
        platform_type: 'api',
        accessibility: 'domestic',
        entry_price: entryPrice,
        limit_desc: '按量付费',
        source_url: this.sourceUrl,
        last_verified: new Date().toISOString(),
        status: 'active',
      },
      tiers: [
        { name: '按量付费', limit_short: '按 tokens 计费', price: 0, description: '无月费', sort_order: 0 },
      ],
      models: [
        { name: 'Doubao-Pro', sort_order: 0 },
        { name: 'Doubao-Lite', sort_order: 1 },
        { name: 'DeepSeek-R1', sort_order: 2 },
        { name: 'DeepSeek-V3', sort_order: 3 },
      ],
      tools: [],
      tags: [{ tag: '按量计费' }],
      rules: [],
      remarks: [{ content: '火山引擎豆包大模型，按 tokens 计费' }],
    };
  }
}
