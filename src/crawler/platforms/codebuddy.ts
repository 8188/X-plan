import { BaseLightCrawler } from '../light/index';
import type { CrawledPlatform } from '../shared/types';

/**
 * CodeBuddy (腾讯) 爬虫
 * 来源: https://www.codebuddy.cn/pricing/
 */
export class CodebuddyCrawler extends BaseLightCrawler {
  slug = 'codebuddy';
  name = 'CodeBuddy';
  sourceUrl = 'https://www.codebuddy.cn/pricing/';

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

    const standardPrice = foundPrices[0] || 70;

    return {
      platform: {
        name: 'CodeBuddy',
        slug: 'codebuddy',
        service: 'CodeBuddy (腾讯)',
        category: 'other',
        billing_unit: 'request_count',
        platform_type: 'ide',
        accessibility: 'domestic',
        entry_price: standardPrice,
        limit_desc: `¥${standardPrice}/月起`,
        source_url: this.sourceUrl,
        last_verified: new Date().toISOString(),
        status: 'active',
      },
      tiers: [
        { name: '体验版', limit_short: '500积分', price: 0, description: '免费版', sort_order: 0 },
        { name: '标准版', limit_short: '4000积分/月', price: standardPrice, description: null, sort_order: 1 },
      ],
      models: [
        { name: 'DeepSeek-R1', sort_order: 0 },
        { name: 'Qwen-Max', sort_order: 1 },
      ],
      tools: [
        { name: '代码补全', sort_order: 0 },
        { name: '代码对话', sort_order: 1 },
        { name: '自动任务', sort_order: 2 },
      ],
      tags: [{ tag: 'IDE插件' }],
      rules: [
        { content: '连续包月7折，年付7折', sort_order: 0 },
      ],
      remarks: [{ content: '腾讯 CodeBuddy，标准版 ¥70/月起' }],
    };
  }
}
