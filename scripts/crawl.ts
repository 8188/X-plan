/**
 * 定时爬虫脚本
 * 由 GitHub Actions 每日触发，爬取各平台最新数据并写入线上 D1
 * 用法: SITE_URL=https://x-plan.pages.dev ADMIN_SECRET=xxx npx tsx scripts/crawl.ts
 */

import { appendFile } from 'node:fs/promises';
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

  const dbClient = new CrawlerDbClient(SITE_URL, ADMIN_SECRET);
  const initResult = await dbClient.initSchema();
  if (!initResult.success) {
    throw new Error(`Schema init failed: ${initResult.error}`);
  }

  const crawlers = getLightCrawlers();
  if (crawlers.length === 0) {
    console.log('⚠️ No crawlers registered yet. Exiting.');
    return;
  }

  console.log(`🕷️ Running ${crawlers.length} crawlers...`);
  const results = await runLightCrawlers(crawlers);

  // 分类结果
  const successData: CrawledPlatform[] = [];
  const fallbacks: { slug: string; name: string }[] = [];
  const failures: { slug: string; error: string }[] = [];

  for (const r of results) {
    if (!r.success) {
      failures.push({ slug: r.slug, error: r.error || 'unknown' });
      console.warn(`❌ ${r.slug}: ${r.error}`);
    } else if (r.fallback) {
      fallbacks.push({ slug: r.slug, name: r.data?.platform?.name || r.slug });
      console.warn(`⚠️ ${r.slug}: fallback (using baseline data)`);
      if (r.data) successData.push(r.data);
    } else {
      if (r.data) successData.push(r.data);
    }
  }

  // 写入 GitHub Actions Job Summary
  const stepSummary = process.env.GITHUB_STEP_SUMMARY;
  if (stepSummary) {
    const lines: string[] = ['## 🕷️ Crawl Results\n'];
    lines.push(`- ✅ Success: ${successData.length - fallbacks.length}/${results.length}`);
    if (fallbacks.length > 0) {
      lines.push(`- ⚠️ Fallback: ${fallbacks.length}/${results.length}`);
      lines.push('  | Platform | Slug |');
      lines.push('  |----------|------|');
      for (const f of fallbacks) {
        lines.push(`  | ${f.name} | \`${f.slug}\` |`);
      }
    }
    if (failures.length > 0) {
      lines.push(`- ❌ Failed: ${failures.length}/${results.length}`);
      lines.push('  | Slug | Error |');
      lines.push('  |------|-------|');
      for (const f of failures) {
        lines.push(`  | \`${f.slug}\` | ${f.error} |`);
      }
    }
    await appendFile(stepSummary, lines.join('\n') + '\n');
  }

  // 设置 GitHub Actions 输出变量
  const githubOutput = process.env.GITHUB_OUTPUT;
  if (githubOutput) {
    const hasIssues = fallbacks.length > 0 || failures.length > 0;
    const fallbackList = fallbacks.map(f => f.name).join(', ');
    const failureList = failures.map(f => f.slug).join(', ');
    await appendFile(githubOutput, `has_issues=${hasIssues}\n`);
    await appendFile(githubOutput, `fallback_count=${fallbacks.length}\n`);
    await appendFile(githubOutput, `fallback_list=${fallbackList}\n`);
    await appendFile(githubOutput, `failure_count=${failures.length}\n`);
    await appendFile(githubOutput, `failure_list=${failureList}\n`);
  }

  if (successData.length === 0) {
    console.log('⚠️ No successful crawl results. Exiting.');
    return;
  }

  console.log(`✅ Crawled ${successData.length}/${results.length} platforms successfully`);

  // 写入线上 D1
  const seedResult = await dbClient.seedData(successData);
  console.log(`🌱 Seed result: ${seedResult.success ? 'OK' : seedResult.error}`);
}

main().catch(e => {
  console.error('❌ Crawl failed:', e);
  process.exit(1);
});
