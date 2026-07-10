import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { DbClient } from '$lib/db';

export const GET: RequestHandler = async ({ platform }) => {
  const db = new DbClient(platform.env.DB);
  const faqs = await db.getFAQs();
  return json(faqs);
};
