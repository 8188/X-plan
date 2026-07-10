import { BaseLightCrawler } from '../light/index';
import type { CrawledPlatform } from '../shared/types';

/**
 * Qoder CN (原通义灵码) 爬虫
 * 来源: https://qoder.com.cn/pricing
 */
export class QoderCnCrawler extends BaseLightCrawler {
  slug = 'qoder-cn';
  name = 'Qoder CN';
  sourceUrl = 'https://qoder.com.cn/pricing';

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

    const proPrice = foundPrices[0] || 59;

    return {
      platform: {
        name: 'Qoder CN',
        slug: 'qoder-cn',
        service: 'Qoder CN (原通义灵码)',
        category: 'other',
        billing_unit: 'request_count',
        platform_type: 'ide',
        accessibility: 'domestic',
        entry_price: proPrice,
        limit_desc: `¥${proPrice}/月起`,
        source_url: this.sourceUrl,
        last_verified: new Date().toISOString(),
        status: 'active',
      },
      tiers: [
        { name: '体验版', limit_short: '有限体验额度', price: 0, description: '免费版', sort_order: 0 },
        { name: '专业版', limit_short: '2,000 Credits/月', price: proPrice, description: null, sort_order: 1 },
      ],
      models: [
        { name: 'Qwen-Max', sort_order: 0 },
        { name: 'Qwen-Plus', sort_order: 1 },
      ],
      tools: [
        { name: '代码补全', sort_order: 0 },
        { name: '代码对话', sort_order: 1 },
        { name: '单元测试生成', sort_order: 2 },
      ],
      tags: [{ tag: 'IDE插件' }],
      rules: [],
      remarks: [{ content: 'Qoder CN (原通义灵码)，专业版 ¥59/月起' }],
    };
  }
}
