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

  try {
    await db.upsertPlatform(data.platform);

    // 如果有关联数据，先获取 platform id
    if (data.tiers || data.models || data.tools || data.tags || data.rules || data.remarks) {
      const saved = await db.getPlatformBySlug(data.platform.slug);
      if (saved) {
        await db.deletePlatformRelated(saved.id);
        if (data.tiers?.length) await db.insertTiers(data.tiers.map((t: any) => ({ ...t, platform_id: saved.id })));
        if (data.models?.length) await db.insertModels(data.models.map((m: any) => ({ ...m, platform_id: saved.id })));
        if (data.tools?.length) await db.insertTools(data.tools.map((t: any) => ({ ...t, platform_id: saved.id })));
        if (data.tags?.length) await db.insertTags(data.tags.map((t: any) => ({ ...t, platform_id: saved.id })));
        if (data.rules?.length) await db.insertRules(data.rules.map((r: any) => ({ ...r, platform_id: saved.id })));
        if (data.remarks?.length) await db.insertRemarks(data.remarks.map((r: any) => ({ ...r, platform_id: saved.id })));
      }
    }

    return json({ success: true });
  } catch (error) {
    return json({ error: String(error) }, { status: 500 });
  }
};
