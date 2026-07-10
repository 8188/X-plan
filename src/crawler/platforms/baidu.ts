import { BaseLightCrawler } from '../light/index';
import type { CrawledPlatform } from '../shared/types';

/**
 * 百度千帆 Coding Plan 爬虫
 * 来源: https://cloud.baidu.com/product/codingplan.html
 */
export class BaiduCrawler extends BaseLightCrawler {
  slug = 'baidu-cloud';
  name = '百度千帆';
  sourceUrl = 'https://cloud.baidu.com/product/codingplan.html';

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
        name: '百度千帆',
        slug: 'baidu-cloud',
        service: '千帆 Token Plan',
        category: 'major',
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
        { name: 'ERNIE-4.0', sort_order: 0 },
        { name: 'ERNIE-3.5', sort_order: 1 },
        { name: 'DeepSeek-R1', sort_order: 2 },
        { name: 'DeepSeek-V3', sort_order: 3 },
      ],
      tools: [],
      tags: [{ tag: '按量计费' }],
      rules: [],
      remarks: [{ content: '千帆平台按 tokens 计费，支持多种模型' }],
    };
  }
}
