import { BaseLightCrawler } from '../light/index';
import type { CrawledPlatform } from '../shared/types';

/**
 * 阿里云百炼 Token Plan 爬虫
 * 来源: https://www.aliyun.com/benefit/scene/tokenplan
 */
export class AliyunCrawler extends BaseLightCrawler {
  slug = 'aliyun-bailian';
  name = '阿里云百炼';
  sourceUrl = 'https://www.aliyun.com/benefit/scene/tokenplan';

  parse(html: string): Partial<CrawledPlatform> {
    const $ = this.loadHtml(html);
    const bodyText = $('body').text();

    // 匹配 tokens 价格: ¥X / 百万tokens
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

    const entryPrice = foundPrices[0] || 0; // 按量付费无月费

    return {
      platform: {
        name: '阿里云百炼',
        slug: 'aliyun-bailian',
        service: '百炼 Token Plan',
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
        { name: 'Qwen-Max', sort_order: 0 },
        { name: 'Qwen-Plus', sort_order: 1 },
        { name: 'Qwen-Turbo', sort_order: 2 },
        { name: 'DeepSeek-R1', sort_order: 3 },
        { name: 'DeepSeek-V3', sort_order: 4 },
      ],
      tools: [],
      tags: [{ tag: '按量计费' }],
      rules: [],
      remarks: [{ content: '百炼平台按 tokens 计费，支持多种模型' }],
    };
  }
}
