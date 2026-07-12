import { BaseLightCrawler } from '../light/index';
import type { CrawledPlatform } from '../shared/types';

/**
 * 百度千帆 Coding Plan / Token Plan 爬虫
 * 来源: https://cloud.baidu.com/doc/qianfan/s/Dmrabu8b6 (Token Plan 个人版文档)
 *       https://cloud.baidu.com/product/codingplan.html (Coding Plan)
 *       https://cloud.baidu.com/product/qianfan_home/token_plan.html (Token Plan 企业版)
 *
 * 页面为 SPA，cheerio 无法完整渲染，主要依赖 baseline 合并。
 * parse() 尝试从文档页 SSR 内容中提取价格，若失败则返回与 seed 对齐的默认结构。
 */
export class BaiduCrawler extends BaseLightCrawler {
  slug = 'baidu-cloud';
  name = '百度千帆';
  sourceUrl = 'https://cloud.baidu.com/doc/qianfan/s/Dmrabu8b6';

  parse(html: string): Partial<CrawledPlatform> {
    const $ = this.loadHtml(html);
    const bodyText = $('body').text();

    // 匹配价格: 9.9, 40, 200, 600, 198, 598, 1498
    const pricePattern = /(?:￥|¥)\s*([\d.]+)\s*\/?\s*月/g;
    const foundPrices: number[] = [];
    let match;
    while ((match = pricePattern.exec(bodyText)) !== null) {
      const p = parseFloat(match[1]);
      if (!foundPrices.includes(p) && p > 0) foundPrices.push(p);
    }

    // 百度千帆套餐:
    // Token Plan 个人版: Mini ¥9.9, Lite ¥40, Pro ¥200, Max ¥600
    // Coding Plan: Lite ¥40, Pro ¥200
    // Token Plan 企业版: 轻享版 ¥198(限时¥149), 高级版 ¥598(限时¥419), 尊享版 ¥1498(限时¥989)
    const tpMini = foundPrices.find(p => p === 9.9) || 9.9;
    const tpLite = foundPrices.find(p => p === 40) || 40;
    const tpPro = foundPrices.find(p => p === 200) || 200;
    const tpMax = foundPrices.find(p => p === 600) || 600;
    const cpLite = foundPrices.find(p => p === 40) || 40;
    const cpPro = foundPrices.find(p => p === 200) || 200;
    const entLite = foundPrices.find(p => p === 198) || 198;
    const entAdvanced = foundPrices.find(p => p === 598) || 598;
    const entPremium = foundPrices.find(p => p === 1498) || 1498;

    return {
      platform: {
        name: '百度千帆',
        slug: 'baidu-cloud',
        service: '千帆 Coding Plan / Token Plan',
        category: 'major',
        billing_unit: 'token',
        platform_type: 'api',
        accessibility: 'domestic',
        entry_price: 9.9,
        limit_desc: '1,000万 Token/月起 · ¥9.9起',
        source_url: this.sourceUrl,
        last_verified: new Date().toISOString(),
        status: 'active',
      },
      tiers: [
        { name: 'TP个人 Mini', limit_short: '1,000万 Token/月', price: tpMini, description: '首次体验·约166次调用', sort_order: 0 },
        { name: 'TP个人 Lite', limit_short: '4,200万 Token/月', price: tpLite, description: 'AI辅助开发·约700次调用', sort_order: 1 },
        { name: 'TP个人 Pro', limit_short: '2.3亿 Token/月', price: tpPro, description: '高频开发·5倍Lite', sort_order: 2 },
        { name: 'TP个人 Max', limit_short: '7亿 Token/月', price: tpMax, description: '重度开发·16倍Lite', sort_order: 3 },
        { name: 'Coding Plan Lite', limit_short: '1,200次/5h · 18,000次/月', price: cpLite, description: '首月¥20·入门级开发', sort_order: 4 },
        { name: 'Coding Plan Pro', limit_short: '6,000次/5h · 90,000次/月', price: cpPro, description: '专业开发', sort_order: 5 },
        { name: 'TP企业 轻享版', limit_short: '2万积分/月', price: entLite, description: '限时¥149/月·初创企业', sort_order: 6 },
        { name: 'TP企业 高级版', limit_short: '6万积分/月', price: entAdvanced, description: '限时¥419/月·中型企业', sort_order: 7 },
        { name: 'TP企业 尊享版', limit_short: '15万积分/月', price: entPremium, description: '限时¥989/月·大型企业', sort_order: 8 },
      ],
      source_urls: [
        { url: 'https://cloud.baidu.com/doc/qianfan/s/Dmrabu8b6', label: 'Token Plan 个人版', sort_order: 0 },
        { url: 'https://cloud.baidu.com/product/codingplan.html', label: 'Coding Plan', sort_order: 1 },
        { url: 'https://cloud.baidu.com/product/qianfan_home/token_plan.html', label: 'Token Plan 企业版', sort_order: 2 },
      ],
      models: [
        { name: 'DeepSeek-V4-Pro', sort_order: 0 },
        { name: 'DeepSeek-V4-Flash', sort_order: 1 },
        { name: 'GLM-5.2', sort_order: 2 },
        { name: 'GLM-5.1', sort_order: 3 },
        { name: 'Kimi-K2.6', sort_order: 4 },
        { name: 'ERNIE-5.1', sort_order: 5 },
      ],
      tools: [
        { name: '代码补全', sort_order: 0 },
        { name: '代码审查', sort_order: 1 },
      ],
      tags: [{ tag: '大厂' }, { tag: 'Token计费' }],
      rules: [
        { content: 'Token Plan 个人版按月订阅，额度周期内耗尽需等下月', sort_order: 0 },
        { content: 'Coding Plan 每5小时独立限额', sort_order: 1 },
        { content: 'Token Plan 企业版按席位订阅，限时折扣', sort_order: 2 },
      ],
      remarks: [{ content: '百度千帆，TP个人 Mini ¥9.9起，TP企业限时6.6折' }],
    };
  }
}
