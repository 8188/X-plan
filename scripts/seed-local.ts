/**
 * 本地开发环境数据导入脚本
 * 用法: npx tsx scripts/seed-local.ts
 * 
 * 需要先运行 pnpm cf-dev 启动本地 Cloudflare 开发服务器
 */

import { seedPlatforms } from '../src/crawler/seed';

const SITE_URL = process.env.SITE_URL || 'http://localhost:5173';
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'dev-secret';

async function main() {
  // Step 1: Initialize database schema (for wrangler pages dev which doesn't auto-apply migrations)
  console.log(`📐 Initializing database schema at ${SITE_URL}...`);
  try {
    const initResponse = await fetch(`${SITE_URL}/api/admin/init`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ADMIN_SECRET}`,
      },
    });
    if (initResponse.ok) {
      const initResult = await initResponse.json() as any;
      console.log(`✅ Schema initialized: ${initResult.tables_created} tables/indexes created`);
    } else {
      console.log(`⚠️ Schema init returned ${initResponse.status} (tables may already exist)`);
    }
  } catch (e) {
    console.log(`⚠️ Schema init skipped (may already exist): ${(e as Error).message}`);
  }

  // Step 1.5: Cleanup removed platforms (slugs no longer in seed data)
  const removedSlugs = ['cline', 'fitten-code', 'continue', 'amazon-q', 'codegeex'];
  for (const slug of removedSlugs) {
    try {
      const delRes = await fetch(`${SITE_URL}/api/admin/platforms/${slug}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${ADMIN_SECRET}` },
      });
      if (delRes.ok) console.log(`🗑️  Removed: ${slug}`);
    } catch { /* ignore */ }
  }

  // Step 2: Seed platform data
  console.log(`🌱 Seeding ${seedPlatforms.length} platforms to ${SITE_URL}...`);

  try {
    const response = await fetch(`${SITE_URL}/api/admin/seed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ADMIN_SECRET}`,
      },
      body: JSON.stringify({ platforms: seedPlatforms }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Seed failed: ${error}`);
    }

    const result = await response.json() as any;
    console.log(`✅ Seed complete! ${result.results?.length || 0} platforms seeded.`);
    
    if (result.results) {
      for (const r of result.results) {
        console.log(`  - ${r.slug}: ${r.status}`);
      }
    }
  } catch (error) {
    console.error('❌ Seed failed:', error);
    console.log('\n💡 Make sure the dev server is running: pnpm cf-dev');
    process.exit(1);
  }
}

main();
