import type { CrawledPlatform } from './shared/types';

/**
 * 爬虫 D1 写入客户端
 * 支持两种模式：
 * 1. 本地模式：通过 wrangler d1 execute 命令行
 * 2. 远程模式：通过 SvelteKit Admin API
 */
export class CrawlerDbClient {
  private apiBaseUrl: string;
  private adminSecret: string;

  constructor(apiBaseUrl: string, adminSecret: string) {
    this.apiBaseUrl = apiBaseUrl;
    this.adminSecret = adminSecret;
  }

  /**
   * 初始化数据库 schema
   */
  async initSchema(): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/admin/init`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.adminSecret}`,
        },
      });

      if (!response.ok) {
        const error = await response.text();
        return { success: false, error };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  /**
   * 写入单个平台数据
   */
  async upsertPlatform(data: CrawledPlatform): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/admin/platforms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.adminSecret}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.text();
        return { success: false, error };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  /**
   * 批量导入数据
   */
  async seedData(platforms: CrawledPlatform[]): Promise<{ success: boolean; results?: Array<{ slug: string; status: string }>; error?: string }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/admin/seed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.adminSecret}`,
        },
        body: JSON.stringify({ platforms }),
      });

      if (!response.ok) {
        const error = await response.text();
        return { success: false, error };
      }

      const result = await response.json() as any;
      return { success: true, results: result.results };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }
}
