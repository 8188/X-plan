import { BaseLightCrawler } from '../light/index';
import type { CrawledPlatform } from '../shared/types';

/**
 * 智谱AI GLM Coding Plan 爬虫
 * 来源: https://open.bigmodel.cn/glm-coding
 */
export class ZhipuAiCrawler extends BaseLightCrawler {
  slug = 'zhipu-ai';
  name = '智谱AI';
  sourceUrl = 'https://open.bigmodel.cn/glm-coding';

  parse(html: string): Partial<CrawledPlatform> {
    const $ = this.loadHtml(html);
    const bodyText = $('body').text();

    // 个人套餐价格匹配: ¥49/月, ¥149/月, ¥469/月
    const personalPrices: { name: string; price: number; limitShort: string; desc: string }[] = [];
    const pricePattern = /¥(\d+)\/月/g;
    const foundPrices: number[] = [];
    let match;
    while ((match = pricePattern.exec(bodyText)) !== null) {
      const p = parseInt(match[1]);
      if (!foundPrices.includes(p)) foundPrices.push(p);
    }

    // 个人套餐
    const personalTiers = [
      { name: 'Lite', limitShort: '基础额度/月', price: 49, desc: '连续包季¥44.1/月' },
      { name: 'Pro', limitShort: '5x Lite额度/月', price: 149, desc: '连续包季¥134.1/月' },
      { name: 'Max', limitShort: '20x Lite额度/月', price: 469, desc: '连续包季¥422.1/月' },
    ];

    // 如果爬到了不同价格，更新
    if (foundPrices.length >= 3) {
      personalTiers[0].price = foundPrices[0];
      personalTiers[1].price = foundPrices[1];
      personalTiers[2].price = foundPrices[2];
    }

    // 团队套餐
    const teamTiers = [
      { name: '团队标准版', limitShort: '0.6亿tokens/5h', price: 598, desc: '年付9折¥538.2/月' },
      { name: '团队高级版', limitShort: '1.6亿tokens/5h', price: 1198, desc: '年付9折¥1078.2/月' },
    ];

    // 尝试匹配团队价格（通常 > 200）
    const teamPrices = foundPrices.filter(p => p > 200);
    if (teamPrices.length >= 2) {
      teamTiers[0].price = teamPrices[0];
      teamTiers[1].price = teamPrices[1];
    }

    const tiers: CrawledPlatform['tiers'] = [
      ...personalTiers.map((t, i) => ({ ...t, sort_order: i })),
      ...teamTiers.map((t, i) => ({ ...t, sort_order: i + 3 })),
    ];

    const entryPrice = personalTiers[0].price;

    return {
      platform: {
        name: '智谱AI',
        slug: 'zhipu-ai',
        service: 'GLM Coding Plan',
        category: 'other',
        billing_unit: 'request_count',
        platform_type: 'api',
        accessibility: 'domestic',
        entry_price: entryPrice,
        limit_desc: `基础额度 · ¥${entryPrice}/月起 · 团队¥${teamTiers[0].price}/月起`,
        source_url: this.sourceUrl,
        last_verified: new Date().toISOString(),
        status: 'active',
        need_rush: true,
      },
      tiers,
      models: [
        { name: 'GLM-4-Plus', sort_order: 0 },
        { name: 'GLM-4-Flash', sort_order: 1 },
        { name: 'DeepSeek-R1', sort_order: 2 },
        { name: 'Qwen-Max', sort_order: 3 },
        { name: 'Claude Sonnet 4', sort_order: 4 },
      ],
      tools: [
        { name: '代码补全', sort_order: 0 },
        { name: '代码翻译', sort_order: 1 },
      ],
      tags: [{ tag: '次数计费' }],
      rules: [
        { content: '连续包季9折，连续包年8折', sort_order: 0 },
        { content: '团队版年付9折，支持席位管理', sort_order: 1 },
      ],
      remarks: [{ content: `智谱AI GLM Coding Plan，Lite ¥${entryPrice}/月起` }],
    };
  }
}
