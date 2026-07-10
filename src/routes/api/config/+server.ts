import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { DbClient } from '$lib/db';

export const GET: RequestHandler = async ({ platform }) => {
  const db = new DbClient(platform.env.DB);
  const configs = await db.getAllConfig();
  // 转为 key-value 对象
  const configMap: Record<string, string> = {};
  for (const c of configs) {
    configMap[c.key] = c.value;
  }
  return json(configMap);
};
