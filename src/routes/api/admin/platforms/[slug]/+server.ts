import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { DbClient } from '$lib/db';

export const DELETE: RequestHandler = async ({ params, platform, request }) => {
  const secret = platform.env.ADMIN_SECRET || 'dev-secret';
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || authHeader !== `Bearer ${secret}`) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = new DbClient(platform.env.DB);
  const slug = params.slug;

  try {
    const p = await db.getPlatformBySlug(slug);
    if (!p) {
      return json({ error: 'Not found' }, { status: 404 });
    }
    await db.deletePlatformRelated(p.id);
    await db.deletePlatform(p.id);
    return json({ success: true, slug });
  } catch (error) {
    return json({ error: String(error) }, { status: 500 });
  }
};
