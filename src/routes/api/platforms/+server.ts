import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { DbClient } from '$lib/db';

export const GET: RequestHandler = async ({ url, platform }) => {
  const db = new DbClient(platform.env.DB);

  const options = {
    category: url.searchParams.get('category') || undefined,
    billing_unit: url.searchParams.get('billing_unit') || undefined,
    platform_type: url.searchParams.get('platform_type') || undefined,
    accessibility: url.searchParams.get('accessibility') || undefined,
    status: url.searchParams.get('status') || undefined,
    search: url.searchParams.get('search') || undefined,
    sort: url.searchParams.get('sort') || undefined,
    order: (url.searchParams.get('order') as 'asc' | 'desc') || undefined,
  };

  const platforms = await db.getPlatforms(options);
  return json(platforms);
};
