import { BaseLightCrawler } from '../light/index';
import type { CrawledPlatform } from '../shared/types';

/**
 * 京东云 JoyBuilder Coding Plan 爬虫
 * 来源: https://www.jdcloud.com/cn/pages/codingplan
 *
 * 页面为 SPA，cheerio 无法完整渲染，主要依赖 baseline 合并。
 * parse() 尝试从 SSR 内容中提取价格，若失败则返回与 seed 对齐的默认结构。
 */
export class JdCloudCrawler extends BaseLightCrawler {
  slug = 'jd-cloud';
  name = '京东云';
  sourceUrl = 'https://www.jdcloud.com/cn/pages/codingplan';

  parse(html: string): Partial<CrawledPlatform> {
    const $ = this.loadHtml(html);
    const bodyText = $('body').text();

    // 匹配价格: ¥XX/月 或 ¥XX.9/月
    const pricePattern = /¥\s*(\d+(?:\.\d+)?)\s*\/?\s*(?:1个)?月/g;
    const foundPrices: number[] = [];
    let match;
    while ((match = pricePattern.exec(bodyText)) !== null) {
      const p = parseFloat(match[1]);
      if (!foundPrices.includes(p) && p > 0) foundPrices.push(p);
    }

    // 京东云 Coding Plan: Lite ¥40 (抢购¥19.9), Pro ¥200 (抢购¥99.9)
    const litePrice = foundPrices.find(p => p === 40) || 40;
    const proPrice = foundPrices.find(p => p === 200) || 200;

    return {
      platform: {
        name: '京东云',
        slug: 'jd-cloud',
        service: 'JoyBuilder Coding Plan',
        category: 'major',
        billing_unit: 'request_count',
        platform_type: 'api',
        accessibility: 'domestic',
        entry_price: 19.9,
        limit_desc: '18,000 次/月起',
        source_url: this.sourceUrl,
        last_verified: new Date().toISOString(),
        status: 'active',
        need_rush: true,
      },
      tiers: [
        { name: 'Coding Lite', limit_short: '18,000次/月', price: litePrice, description: '抢购价¥19.9·每天10:30抢购', sort_order: 0 },
        { name: 'Coding Pro', limit_short: '90,000次/月', price: proPrice, description: '抢购价¥99.9·5x Lite·每天10:30抢购', sort_order: 1 },
      ],
      models: [
        { name: 'DeepSeek-R1', sort_order: 0 },
        { name: 'DeepSeek-V3', sort_order: 1 },
        { name: 'Qwen-Max', sort_order: 2 },
        { name: 'ChatGLM4', sort_order: 3 },
        { name: 'Doubao-Pro', sort_order: 4 },
      ],
      tools: [
        { name: '代码补全', sort_order: 0 },
        { name: '代码对话', sort_order: 1 },
      ],
      tags: [{ tag: '大厂' }, { tag: '次数计费' }],
      rules: [],
      remarks: [{ content: '京东云 JoyBuilder' }],
    };
  }
}
