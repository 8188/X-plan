import { BaseLightCrawler } from '../light/index';
import type { CrawledPlatform } from '../shared/types';

/**
 * GitHub Copilot 爬虫
 * 来源: https://github.com/features/copilot#pricing
 */
export class GithubCopilotCrawler extends BaseLightCrawler {
  slug = 'github-copilot';
  name = 'GitHub Copilot';
  sourceUrl = 'https://github.com/features/copilot#pricing';

  parse(html: string): Partial<CrawledPlatform> {
    const $ = this.loadHtml(html);
    const bodyText = $('body').text();

    // 匹配价格: $10/month, $19/month, $39/month, $19/user/month
    const pricePattern = /\$(\d+)\s*\/?\s*(?:user\s*\/?\s*)?month/gi;
    const foundPrices: number[] = [];
    let match;
    while ((match = pricePattern.exec(bodyText)) !== null) {
      const p = parseInt(match[1]);
      if (!foundPrices.includes(p) && p > 0) foundPrices.push(p);
    }

    const individualPrice = foundPrices.find(p => p <= 15) || 10;
    const businessPrice = foundPrices.find(p => p > 15 && p <= 25) || 19;
    const enterprisePrice = foundPrices.find(p => p > 25 && p <= 50) || 39;

    return {
      platform: {
        name: 'GitHub Copilot',
        slug: 'github-copilot',
        service: 'GitHub Copilot',
        category: 'other',
        billing_unit: 'request_count',
        platform_type: 'ide',
        accessibility: 'foreign_accessible',
        entry_price: individualPrice,
        limit_desc: `$${individualPrice}/月`,
        source_url: this.sourceUrl,
        last_verified: new Date().toISOString(),
        status: 'active',
      },
      tiers: [
        { name: 'Individual', limit_short: '标准额度/月', price: individualPrice, description: null, sort_order: 0 },
        { name: 'Business', limit_short: '团队管理', price: businessPrice, description: null, sort_order: 1 },
        { name: 'Enterprise', limit_short: '企业功能', price: enterprisePrice, description: null, sort_order: 2 },
      ],
      models: [
        { name: 'Claude Sonnet 4', sort_order: 0 },
        { name: 'GPT-4o', sort_order: 1 },
        { name: 'Gemini 2.5 Pro', sort_order: 2 },
        { name: 'o3-mini', sort_order: 3 },
      ],
      tools: [
        { name: 'VS Code', sort_order: 0 },
        { name: 'JetBrains', sort_order: 1 },
        { name: 'Neovim', sort_order: 2 },
      ],
      tags: [{ tag: '次数计费' }],
      rules: [],
      remarks: [],
    };
  }
}
