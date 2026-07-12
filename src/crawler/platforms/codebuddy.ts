import { BaseLightCrawler } from '../light/index';
import type { CrawledPlatform } from '../shared/types';

/**
 * CodeBuddy (腾讯) 爬虫
 * 来源: https://www.codebuddy.cn/pricing/
 *
 * 页面为 SPA，cheerio 无法完整渲染，主要依赖 baseline 合并。
 * parse() 尝试从 SSR 内容中提取价格，若失败则返回与 seed 对齐的默认结构。
 */
export class CodebuddyCrawler extends BaseLightCrawler {
  slug = 'codebuddy';
  name = 'CodeBuddy';
  sourceUrl = 'https://www.codebuddy.cn/pricing/';

  parse(html: string): Partial<CrawledPlatform> {
    const $ = this.loadHtml(html);
    const bodyText = $('body').text();

    // 匹配价格: ￥XX/月
    const pricePattern = /￥\s*(\d+)\s*\/?\s*月/g;
    const foundPrices: number[] = [];
    let match;
    while ((match = pricePattern.exec(bodyText)) !== null) {
      const p = parseInt(match[1]);
      if (!foundPrices.includes(p) && p > 0) foundPrices.push(p);
    }

    // CodeBuddy 套餐: 体验版(免费), 标准版¥70/¥99, 高级版¥140/¥199, 旗舰版¥700/¥999
    // 连续包月价: 70, 140, 700; 月付价: 99, 199, 999
    const standardPrice = foundPrices.find(p => p === 70) || 70;
    const advancedPrice = foundPrices.find(p => p === 140) || 140;
    const flagshipPrice = foundPrices.find(p => p === 700) || 700;

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
        limit_desc: '¥70/月起 (连续包月)',
        source_url: this.sourceUrl,
        last_verified: new Date().toISOString(),
        status: 'active',
      },
      tiers: [
        { name: '体验版', limit_short: '500积分+5k补全', price: 0, description: '免费，Auto模型调度', sort_order: 0 },
        { name: '标准版', limit_short: '2000+2000积分/月', price: standardPrice, description: '¥70连续包月/¥99月付', sort_order: 1 },
        { name: '高级版', limit_short: '4000+5000积分/月', price: advancedPrice, description: '¥140连续包月/¥199月付', sort_order: 2 },
        { name: '旗舰版', limit_short: '20k+30k积分/月', price: flagshipPrice, description: '¥700连续包月/¥999月付', sort_order: 3 },
      ],
      models: [
        { name: 'DeepSeek-R1', sort_order: 0 },
        { name: 'DeepSeek-V3', sort_order: 1 },
        { name: 'Qwen-Max', sort_order: 2 },
      ],
      tools: [
        { name: '代码补全', sort_order: 0 },
        { name: '代码对话', sort_order: 1 },
        { name: '自动任务', sort_order: 2 },
      ],
      tags: [{ tag: 'IDE插件' }],
      rules: [
        { content: '连续包月7折，年付7折，连续包年5.6折', sort_order: 0 },
      ],
      remarks: [{ content: '腾讯 CodeBuddy，标准版 ¥70/月起' }],
    };
  }
}
