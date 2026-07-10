import { BaseLightCrawler } from '../light/index';
import type { CrawledPlatform } from '../shared/types';

/**
 * Claude Code (CLI) 爬虫
 * 来源: https://claude.com/pricing
 */
export class ClaudeCodeCrawler extends BaseLightCrawler {
  slug = 'claude-code';
  name = 'Claude Code';
  sourceUrl = 'https://claude.com/pricing';

  parse(html: string): Partial<CrawledPlatform> {
    const $ = this.loadHtml(html);
    const bodyText = $('body').text();

    const pricePattern = /\$(\d+)\s*\/?\s*month/gi;
    const foundPrices: number[] = [];
    let match;
    while ((match = pricePattern.exec(bodyText)) !== null) {
      const p = parseInt(match[1]);
      if (!foundPrices.includes(p) && p > 0) foundPrices.push(p);
    }

    const proPrice = foundPrices.find(p => p <= 30) || 20;
    const maxPrice = foundPrices.find(p => p > 50 && p <= 120) || 100;

    return {
      platform: {
        name: 'Claude Code',
        slug: 'claude-code',
        service: 'Claude Code (CLI)',
        category: 'other',
        billing_unit: 'request_count',
        platform_type: 'ide',
        accessibility: 'foreign_blocked',
        entry_price: proPrice * 7.2,
        limit_desc: `Pro $${proPrice}/月起`,
        source_url: this.sourceUrl,
        last_verified: new Date().toISOString(),
        status: 'active',
      },
      tiers: [
        { name: 'Free', limit_short: '基础用量', price: 0, description: '免费版', sort_order: 0 },
        { name: 'Pro', limit_short: '标准用量', price: proPrice * 7.2, description: null, sort_order: 1 },
        { name: 'Max 5x', limit_short: '5x Pro用量', price: maxPrice * 7.2, description: null, sort_order: 2 },
      ],
      models: [
        { name: 'Claude Opus 4', sort_order: 0 },
        { name: 'Claude Sonnet 4', sort_order: 1 },
      ],
      tools: [
        { name: 'Agent 模式', sort_order: 0 },
        { name: '终端命令', sort_order: 1 },
        { name: '文件操作', sort_order: 2 },
      ],
      tags: [{ tag: 'Agent' }, { tag: 'CLI' }],
      rules: [],
      remarks: [{ content: 'Claude Code，Anthropic 官方终端 Agent' }],
    };
  }
}
