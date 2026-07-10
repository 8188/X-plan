import { BaseLightCrawler } from '../light/index';
import type { CrawledPlatform } from '../shared/types';

/**
 * 腾讯云 Hy Token Plan 爬虫
 * 来源: https://cloud.tencent.com/act/pro/tokenplan
 */
export class TencentCrawler extends BaseLightCrawler {
  slug = 'tencent-cloud';
  name = '腾讯云';
  sourceUrl = 'https://cloud.tencent.com/act/pro/tokenplan';

  parse(html: string): Partial<CrawledPlatform> {
    const $ = this.loadHtml(html);
    const bodyText = $('body').text();

    // 匹配价格: ¥XX/月
    const pricePattern = /¥(\d+)\s*\/?\s*月/g;
    const foundPrices: number[] = [];
    let match;
    while ((match = pricePattern.exec(bodyText)) !== null) {
      const p = parseInt(match[1]);
      if (!foundPrices.includes(p) && p > 0) foundPrices.push(p);
    }

    const proPrice = foundPrices[0] || 59;
    const teamPrice = foundPrices[1] || 199;

    return {
      platform: {
        name: '腾讯云',
        slug: 'tencent-cloud',
        service: 'Hy Token Plan / 通用 Token Plan',
        category: 'major',
        billing_unit: 'token',
        platform_type: 'api',
        accessibility: 'domestic',
        entry_price: proPrice,
        limit_desc: `¥${proPrice}/月起`,
        source_url: this.sourceUrl,
        last_verified: new Date().toISOString(),
        status: 'active',
      },
      tiers: [
        { name: 'Pro', limit_short: '标准额度/月', price: proPrice, description: null, sort_order: 0 },
        { name: 'Team', limit_short: '团队额度/月', price: teamPrice, description: null, sort_order: 1 },
      ],
      models: [
        { name: 'DeepSeek-R1', sort_order: 0 },
        { name: 'DeepSeek-V3', sort_order: 1 },
        { name: 'hunyuan-turbos', sort_order: 2 },
      ],
      tools: [
        { name: 'VS Code 插件', sort_order: 0 },
        { name: 'JetBrains 插件', sort_order: 1 },
      ],
      tags: [{ tag: '次数计费' }],
      rules: [],
      remarks: [],
    };
  }
}
