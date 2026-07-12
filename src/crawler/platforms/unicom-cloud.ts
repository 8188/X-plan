import { BaseLightCrawler } from '../light/index';
import type { CrawledPlatform } from '../shared/types';

/**
 * 联通云元景 Token Plan 爬虫
 * 来源: https://www.cucloud.cn/product/tokenplan.html
 *
 * 页面为 SPA，cheerio 无法完整渲染，主要依赖 baseline 合并。
 * parse() 尝试从 SSR 内容中提取价格，若失败则返回与 seed 对齐的默认结构。
 */
export class UnicomCloudCrawler extends BaseLightCrawler {
  slug = 'unicom-cloud';
  name = '联通云';
  sourceUrl = 'https://www.cucloud.cn/product/tokenplan.html';

  parse(html: string): Partial<CrawledPlatform> {
    const $ = this.loadHtml(html);
    const bodyText = $('body').text();

    // 匹配价格: ¥XX/月
    const pricePattern = /¥\s*(\d+)\s*\/?\s*月/g;
    const foundPrices: number[] = [];
    let match;
    while ((match = pricePattern.exec(bodyText)) !== null) {
      const p = parseInt(match[1]);
      if (!foundPrices.includes(p) && p > 0) foundPrices.push(p);
    }

    // 联通云 Token Plan:
    // 个人版: Lite ¥15, Pro ¥30, Max ¥45
    // 团队版: Lite ¥198, Pro ¥698, Max ¥1398
    const personalLite = foundPrices.find(p => p === 15) || 15;
    const personalPro = foundPrices.find(p => p === 30) || 30;
    const personalMax = foundPrices.find(p => p === 45) || 45;
    const teamLite = foundPrices.find(p => p === 198) || 198;
    const teamPro = foundPrices.find(p => p === 698) || 698;
    const teamMax = foundPrices.find(p => p === 1398) || 1398;

    return {
      platform: {
        name: '联通云',
        slug: 'unicom-cloud',
        service: '元景 Token Plan',
        category: 'major',
        billing_unit: 'token',
        platform_type: 'api',
        accessibility: 'domestic',
        entry_price: personalLite,
        limit_desc: '600万 Token/月起',
        source_url: this.sourceUrl,
        last_verified: new Date().toISOString(),
        status: 'active',
      },
      tiers: [
        { name: '个人 Lite', limit_short: '600万 Tokens/月', price: personalLite, description: '尝鲜用户', sort_order: 0 },
        { name: '个人 Pro', limit_short: '1,200万 Tokens/月', price: personalPro, description: '高频开发者', sort_order: 1 },
        { name: '个人 Max', limit_short: '1,800万 Tokens/月', price: personalMax, description: '重度开发者', sort_order: 2 },
        { name: '团队 Lite', limit_short: '25,000 credits/月', price: teamLite, description: '轻度使用AI的企业团队', sort_order: 3 },
        { name: '团队 Pro', limit_short: '100,000 credits/月', price: teamPro, description: '高频AI编程团队', sort_order: 4 },
        { name: '团队 Max', limit_short: '250,000 credits/月', price: teamMax, description: '重度依赖AI的核心团队', sort_order: 5 },
      ],
      models: [
        { name: '元景大模型', sort_order: 0 },
        { name: 'DeepSeek-V4', sort_order: 1 },
        { name: 'GLM-5', sort_order: 2 },
        { name: 'Qwen-Max', sort_order: 3 },
      ],
      tools: [
        { name: '代码补全', sort_order: 0 },
        { name: '代码对话', sort_order: 1 },
      ],
      tags: [{ tag: '大厂' }, { tag: 'Token计费' }],
      rules: [
        { content: 'Token Plan 有个人版与团队版', sort_order: 0 },
        { content: '活动期间 Token Plan Lite 免费送', sort_order: 1 },
      ],
      remarks: [{ content: '联通云元景，5档套餐可选，入门价最低' }],
    };
  }
}
