import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { DbClient } from '$lib/db';

export const POST: RequestHandler = async ({ request, platform }) => {
  // 验证认证
  const secret = platform.env.ADMIN_SECRET || 'dev-secret';
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || authHeader !== `Bearer ${secret}`) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await request.json();
  const db = new DbClient(platform.env.DB);
  const results: { slug: string; status: string }[] = [];

  try {
    for (const item of data.platforms) {
      await db.upsertPlatform(item.platform);
      const saved = await db.getPlatformBySlug(item.platform.slug);

      if (saved) {
        await db.deletePlatformRelated(saved.id);
        if (item.tiers?.length) await db.insertTiers(item.tiers.map((t: any) => ({ ...t, platform_id: saved.id })));
        if (item.models?.length) await db.insertModels(item.models.map((m: any) => ({ ...m, platform_id: saved.id })));
        if (item.tools?.length) await db.insertTools(item.tools.map((t: any) => ({ ...t, platform_id: saved.id })));
        if (item.tags?.length) await db.insertTags(item.tags.map((t: any) => ({ ...t, platform_id: saved.id })));
        if (item.rules?.length) await db.insertRules(item.rules.map((r: any) => ({ ...r, platform_id: saved.id })));
        if (item.remarks?.length) await db.insertRemarks(item.remarks.map((r: any) => ({ ...r, platform_id: saved.id })));
        if (item.source_urls?.length) await db.insertSourceUrls(item.source_urls.map((s: any) => ({ ...s, platform_id: saved.id })));
      }

      results.push({ slug: item.platform.slug, status: 'ok' });
    }

    return json({ success: true, results });
  } catch (error) {
    return json({ error: String(error), results }, { status: 500 });
  }
};
