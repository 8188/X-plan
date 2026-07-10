import { BaseLightCrawler } from '../light/index';
import type { CrawledPlatform } from '../shared/types';

/**
 * 摩尔线程 AI Coding Plan 爬虫
 * 来源: https://code.mthreads.com/
 */
export class MthreadsCrawler extends BaseLightCrawler {
  slug = 'mthreads';
  name = '摩尔线程';
  sourceUrl = 'https://code.mthreads.com/';

  parse(html: string): Partial<CrawledPlatform> {
    const $ = this.loadHtml(html);

    // 从页面提取套餐价格，格式如 "¥ 120 / 季度"
    const tiers: CrawledPlatform['tiers'] = [];
    const tierNames = ['Free Trial', 'Lite Plan', 'Pro Plan', 'Max Plan'];
    const tierShortNames = ['Free Trial', 'Lite', 'Pro', 'Max'];

    // 尝试从页面文本中提取价格
    const bodyText = $('body').text();

    // 匹配价格模式: ¥ 120 / 季度, ¥ 600 / 季度, ¥ 1200 / 季度
    const pricePattern = /¥\s*(\d+)\s*\/\s*季度/g;
    const prices: number[] = [];
    let match;
    while ((match = pricePattern.exec(bodyText)) !== null) {
      prices.push(parseInt(match[1]));
    }

    // Free Trial 价格为 0
    const allPrices = [0, ...prices];

    const limitShorts = ['~40次/5h', '~120次/5h', '~600次/5h', '~2,400次/5h'];
    const descriptions = [
      '每日限量100名·30天有效',
      `¥${prices[0] || 120}/季度·3x Free用量`,
      `¥${prices[1] || 600}/季度·5x Lite用量`,
      `¥${prices[2] || 1200}/季度·4x Pro用量`,
    ];

    for (let i = 0; i < 4; i++) {
      tiers.push({
        name: tierShortNames[i],
        limit_short: limitShorts[i],
        price: allPrices[i] || 0,
        description: descriptions[i],
        sort_order: i,
      });
    }

    return {
      platform: {
        name: '摩尔线程',
        slug: 'mthreads',
        service: 'AI Coding Plan',
        category: 'other',
        billing_unit: 'request_count',
        platform_type: 'api',
        accessibility: 'domestic',
        entry_price: allPrices[1] ? Math.round(allPrices[1] / 3) : 40,
        limit_desc: `~40 次/5h · ¥${allPrices[1] ? Math.round(allPrices[1] / 3) : 40}/月起`,
        source_url: this.sourceUrl,
        last_verified: new Date().toISOString(),
        status: 'active',
        need_rush: true,
      },
      tiers,
      models: [{ name: 'GLM 4.7', sort_order: 0 }],
      tools: [
        { name: 'Claude Code', sort_order: 0 },
        { name: 'Cursor', sort_order: 1 },
        { name: 'OpenCode', sort_order: 2 },
        { name: 'Cline', sort_order: 3 },
        { name: 'Kilo Code', sort_order: 4 },
        { name: 'Roo Code', sort_order: 5 },
      ],
      tags: [{ tag: '次数计费' }],
      rules: [],
      remarks: [
        { content: `季付制，Lite=¥${allPrices[1] ? Math.round(allPrices[1] / 3) : 40}/月，Pro=¥${allPrices[2] ? Math.round(allPrices[2] / 3) : 200}/月，Max=¥${allPrices[3] ? Math.round(allPrices[3] / 3) : 400}/月` },
        { content: '每次prompt约15-20次模型调用' },
      ],
    };
  }
}
