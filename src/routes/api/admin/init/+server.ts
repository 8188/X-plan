import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { DbClient } from '$lib/db';

export const POST: RequestHandler = async ({ request, platform }) => {
  const secret = platform.env.ADMIN_SECRET || 'dev-secret';
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || authHeader !== `Bearer ${secret}`) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = new DbClient(platform.env.DB);

  try {
    const results = await db.initSchema();
    return json({ success: true, tables_created: results.length });
  } catch (error) {
    return json({ error: String(error) }, { status: 500 });
  }
};
