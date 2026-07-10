/**
 * 定时爬虫脚本
 * 由 GitHub Actions 每日触发，爬取各平台最新数据并写入线上 D1
 * 用法: SITE_URL=https://x-plan.pages.dev ADMIN_SECRET=xxx npx tsx scripts/crawl.ts
 */

import { getLightCrawlers } from '../src/crawler/platforms/index';
import { runLightCrawlers } from '../src/crawler/light/index';
import { CrawlerDbClient } from '../src/crawler/db-client';
import type { CrawledPlatform } from '../src/crawler/shared/types';

const SITE_URL = process.env.SITE_URL || 'https://x-plan.pages.dev';
const ADMIN_SECRET = process.env.ADMIN_SECRET || '';

async function main() {
  if (!ADMIN_SECRET) {
    console.error('❌ ADMIN_SECRET is required');
    process.exit(1);
  }

  const crawlers = getLightCrawlers();
  if (crawlers.length === 0) {
    console.log('⚠️ No crawlers registered yet. Exiting.');
    return;
  }

  console.log(`🕷️ Running ${crawlers.length} crawlers...`);
  const results = await runLightCrawlers(crawlers);

  const successData: CrawledPlatform[] = results
    .filter(r => r.success && r.data)
    .map(r => r.data!);

  for (const r of results.filter(r => !r.success)) {
    console.warn(`❌ ${r.slug}: ${r.error}`);
  }

  if (successData.length === 0) {
    console.log('⚠️ No successful crawl results. Exiting.');
    return;
  }

  console.log(`✅ Crawled ${successData.length}/${results.length} platforms successfully`);

  // 写入线上 D1
  const dbClient = new CrawlerDbClient(SITE_URL, ADMIN_SECRET);
  const seedResult = await dbClient.seedData(successData);
  console.log(`🌱 Seed result: ${seedResult.success ? 'OK' : seedResult.error}`);
}

main().catch(e => {
  console.error('❌ Crawl failed:', e);
  process.exit(1);
});
