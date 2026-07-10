import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { DbClient } from '$lib/db';

export const GET: RequestHandler = async ({ params, platform }) => {
  const db = new DbClient(platform.env.DB);
  const detail = await db.getPlatformDetail(params.slug);

  if (!detail) {
    return json({ error: 'Platform not found' }, { status: 404 });
  }

  return json(detail);
};
