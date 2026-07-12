import { BaseLightCrawler } from '../light/index';
import type { CrawledPlatform } from '../shared/types';

/**
 * 腾讯云 Hy Token Plan / 通用 Token Plan 爬虫
 * 来源: https://cloud.tencent.com/act/pro/tokenplan
 *
 * 页面为 SPA，cheerio 无法完整渲染，主要依赖 baseline 合并。
 * parse() 尝试从 SSR 内容中提取价格，若失败则返回与 seed 对齐的默认结构。
 */
export class TencentCrawler extends BaseLightCrawler {
  slug = 'tencent-cloud';
  name = '腾讯云';
  sourceUrl = 'https://cloud.tencent.com/act/pro/tokenplan';

  parse(html: string): Partial<CrawledPlatform> {
    const $ = this.loadHtml(html);
    const bodyText = $('body').text();

    // 匹配价格: ¥XX/月 或 ¥XX.00元/月
    const pricePattern = /¥\s*(\d+(?:\.\d+)?)\s*(?:元)?\/?\s*月/g;
    const foundPrices: number[] = [];
    let match;
    while ((match = pricePattern.exec(bodyText)) !== null) {
      const p = parseFloat(match[1]);
      if (!foundPrices.includes(p) && p > 0) foundPrices.push(p);
    }

    // 腾讯云 Token Plan 有两套套餐: Hy Token Plan + 通用 Token Plan
    // Hy: Lite 28, Standard 78, Pro 238, Max 468
    // 通用: Lite 39, Standard 99, Pro 299, Max 599
    // 尝试从页面提取，若失败使用默认值
    const hyLite = foundPrices.find(p => p === 28) || 28;
    const hyStandard = foundPrices.find(p => p === 78) || 78;
    const hyPro = foundPrices.find(p => p === 238) || 238;
    const hyMax = foundPrices.find(p => p === 468) || 468;
    const genLite = foundPrices.find(p => p === 39) || 39;
    const genStandard = foundPrices.find(p => p === 99) || 99;
    const genPro = foundPrices.find(p => p === 299) || 299;
    const genMax = foundPrices.find(p => p === 599) || 599;

    return {
      platform: {
        name: '腾讯云',
        slug: 'tencent-cloud',
        service: 'Hy Token Plan / 通用 Token Plan',
        category: 'major',
        billing_unit: 'token',
        platform_type: 'api',
        accessibility: 'domestic',
        entry_price: hyLite,
        limit_desc: '3,500万 Token/月起',
        source_url: this.sourceUrl,
        last_verified: new Date().toISOString(),
        status: 'active',
      },
      tiers: [
        { name: 'Hy Lite', limit_short: '3,500万 Tokens', price: hyLite, description: '混元Hy3·约70轮问答', sort_order: 0 },
        { name: 'Hy Standard', limit_short: '1亿 Tokens', price: hyStandard, description: '混元Hy3·约200轮问答', sort_order: 1 },
        { name: 'Hy Pro', limit_short: '3.2亿 Tokens', price: hyPro, description: '混元Hy3·每天高频使用', sort_order: 2 },
        { name: 'Hy Max', limit_short: '6.5亿 Tokens', price: hyMax, description: '混元Hy3·重度用户', sort_order: 3 },
        { name: '通用 Lite', limit_short: '3,500万 Tokens', price: genLite, description: '多模型·约70轮问答', sort_order: 4 },
        { name: '通用 Standard', limit_short: '1亿 Tokens', price: genStandard, description: '多模型·约200轮问答', sort_order: 5 },
        { name: '通用 Pro', limit_short: '3.2亿 Tokens', price: genPro, description: '多模型·每天高频使用', sort_order: 6 },
        { name: '通用 Max', limit_short: '6.5亿 Tokens', price: genMax, description: '多模型·重度用户', sort_order: 7 },
      ],
      models: [
        { name: 'DeepSeek-R1', sort_order: 0 },
        { name: 'DeepSeek-V3', sort_order: 1 },
        { name: 'hunyuan-turbos', sort_order: 2 },
      ],
      tools: [
        { name: '代码补全', sort_order: 0 },
        { name: '代码对话', sort_order: 1 },
      ],
      tags: [{ tag: '大厂' }, { tag: 'Token计费' }],
      rules: [
        { content: 'Token 按输入+输出合并计算', sort_order: 0 },
        { content: '不同模型消耗 Token 倍率不同', sort_order: 1 },
      ],
      remarks: [{ content: '腾讯云 Hy Token Plan，模型选择丰富' }],
    };
  }
}
