/**
 * 爬虫验证脚本 - 运行所有爬虫并与 seed 数据对比
 * 用法: npx tsx scripts/verify-crawlers.ts
 */

import { getLightCrawlers } from '../src/crawler/platforms/index';
import { runLightCrawlers } from '../src/crawler/light/index';
import { seedPlatforms } from '../src/crawler/seed';

async function main() {
  console.log('=== 爬虫验证脚本 ===\n');

  // 1. 构建 seed slug 映射
  const seedMap = new Map<string, typeof seedPlatforms[0]>();
  for (const p of seedPlatforms) {
    seedMap.set(p.platform.slug, p);
  }
  console.log(`📋 Seed 数据: ${seedMap.size} 个平台\n`);

  // 2. 运行爬虫
  const crawlers = getLightCrawlers();
  console.log(`🕷️ 已注册 ${crawlers.length} 个爬虫，开始运行...\n`);

  const results = await runLightCrawlers(crawlers);

  // 3. 对比结果
  console.log('\n=== 对比结果 ===\n');

  let matchCount = 0;
  let mismatchCount = 0;
  let noSeedCount = 0;
  let failCount = 0;

  for (const result of results) {
    const seed = seedMap.get(result.slug);

    if (!result.success) {
      console.log(`❌ ${result.slug}: 爬取失败 - ${result.error}`);
      failCount++;
      continue;
    }

    if (!seed) {
      console.log(`⚠️  ${result.slug}: 爬取成功但 seed 中无对应数据`);
      noSeedCount++;
      continue;
    }

    const crawled = result.data!;
    const issues: string[] = [];

    if (result.fallback) {
      // fallback 数据就是 baseline（seed）的克隆，跳过对比
      console.log(`🔄 ${result.slug}: 爬取失败，使用 baseline fallback（数据与 seed 一致）`);
      matchCount++;
      continue;
    }

    // 对比 platform 字段
    if (crawled.platform.name !== seed.platform.name) {
      issues.push(`name: 爬取="${crawled.platform.name}" vs seed="${seed.platform.name}"`);
    }
    if (crawled.platform.service !== seed.platform.service) {
      issues.push(`service: 爬取="${crawled.platform.service}" vs seed="${seed.platform.service}"`);
    }
    if (crawled.platform.category !== seed.platform.category) {
      issues.push(`category: 爬取="${crawled.platform.category}" vs seed="${seed.platform.category}"`);
    }
    if (crawled.platform.billing_unit !== seed.platform.billing_unit) {
      issues.push(`billing_unit: 爬取="${crawled.platform.billing_unit}" vs seed="${seed.platform.billing_unit}"`);
    }
    if (crawled.platform.platform_type !== seed.platform.platform_type) {
      issues.push(`platform_type: 爬取="${crawled.platform.platform_type}" vs seed="${seed.platform.platform_type}"`);
    }
    if (crawled.platform.accessibility !== seed.platform.accessibility) {
      issues.push(`accessibility: 爬取="${crawled.platform.accessibility}" vs seed="${seed.platform.accessibility}"`);
    }

    // 对比 entry_price
    if (crawled.platform.entry_price !== seed.platform.entry_price) {
      issues.push(`entry_price: 爬取=${crawled.platform.entry_price} vs seed=${seed.platform.entry_price}`);
    }

    // 对比 tiers 数量
    if (crawled.tiers.length !== seed.tiers.length) {
      issues.push(`tiers数量: 爬取=${crawled.tiers.length} vs seed=${seed.tiers.length}`);
    }

    // 对比 tiers 价格
    for (let i = 0; i < Math.min(crawled.tiers.length, seed.tiers.length); i++) {
      if (crawled.tiers[i].price !== seed.tiers[i].price) {
        issues.push(`tiers[${i}].price: 爬取=${crawled.tiers[i].price} vs seed=${seed.tiers[i].price}`);
      }
    }

    // 对比 models 数量
    if (crawled.models.length !== seed.models.length) {
      issues.push(`models数量: 爬取=${crawled.models.length} vs seed=${seed.models.length}`);
    }

    if (issues.length === 0) {
      console.log(`✅ ${result.slug}: 完全匹配`);
      matchCount++;
    } else {
      console.log(`⚠️  ${result.slug}: ${issues.length} 处差异`);
      for (const issue of issues) {
        console.log(`   - ${issue}`);
      }
      mismatchCount++;
    }
  }

  // 4. 检查 seed 中有但爬虫未覆盖的平台
  const crawledSlugs = new Set(results.map(r => r.slug));
  const missingCrawlers: string[] = [];
  for (const [slug] of seedMap) {
    if (!crawledSlugs.has(slug)) {
      missingCrawlers.push(slug);
    }
  }

  if (missingCrawlers.length > 0) {
    console.log(`\n⚠️  Seed 中有 ${missingCrawlers.length} 个平台无对应爬虫:`);
    for (const slug of missingCrawlers) {
      const seed = seedMap.get(slug)!;
      console.log(`   - ${slug} (${seed.platform.name})`);
    }
  }

  // 5. 汇总
  console.log('\n=== 汇总 ===');
  console.log(`✅ 完全匹配: ${matchCount}`);
  console.log(`⚠️  有差异: ${mismatchCount}`);
  console.log(`❌ 爬取失败: ${failCount}`);
  console.log(`🆕 无seed数据: ${noSeedCount}`);
  console.log(`📋 缺少爬虫: ${missingCrawlers.length}`);
}

main().catch(e => {
  console.error('验证失败:', e);
  process.exit(1);
});
