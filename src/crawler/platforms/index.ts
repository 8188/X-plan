import type { LightCrawler } from '../light/index';
import type { HeavyCrawler } from '../heavy/index';
import { seedPlatforms } from '../seed';

// API 平台爬虫
import { TencentCrawler } from './tencent';
import { AliyunCrawler } from './aliyun';
import { BaiduCrawler } from './baidu';
import { VolcengineCrawler } from './volcengine';
import { HuaweiCloudCrawler } from './huawei-cloud';
import { XfyunSparkCrawler } from './xfyun-spark';
import { JdCloudCrawler } from './jd-cloud';
import { XiaomiCrawler } from './xiaomi';
import { UnicomCloudCrawler } from './unicom-cloud';
import { ZhipuAiCrawler } from './zhipu-ai';
import { MinimaxCrawler } from './minimax';
import { KimiCrawler } from './kimi';
import { SensenovaCrawler } from './sensenova';
import { KuaishouCrawler } from './kuaishou';
import { MthreadsCrawler } from './mthreads';
import { UcloudCrawler } from './ucloud';
import { ZaiCrawler } from './z-ai';
import { OpencodeCrawler } from './opencode';

// IDE 平台爬虫
import { CursorCrawler } from './cursor';
import { WindsurfCrawler } from './windsurf';
import { AugmentCodeCrawler } from './augment-code';
import { TraeCrawler } from './trae';
import { QoderCnCrawler } from './qoder-cn';
import { QoderCrawler } from './qoder';
import { CodebuddyCrawler } from './codebuddy';
import { GithubCopilotCrawler } from './github-copilot';
import { ClaudeCodeCrawler } from './claude-code';

import type { BaseLightCrawler } from '../light/index';

/**
 * 构建 slug -> seed 数据映射
 */
function buildSeedMap(): Map<string, typeof seedPlatforms[0]> {
  const map = new Map<string, typeof seedPlatforms[0]>();
  for (const p of seedPlatforms) {
    map.set(p.platform.slug, p);
  }
  return map;
}

/**
 * 为爬虫注入 seed baseline 数据
 */
function injectBaseline(crawlers: BaseLightCrawler[]): void {
  const seedMap = buildSeedMap();
  for (const crawler of crawlers) {
    const seed = seedMap.get(crawler.slug);
    if (seed) {
      crawler.setBaseline(seed);
    }
  }
}

/**
 * 获取所有已注册的轻量爬虫
 * 每个平台一个爬虫模块，seed 数据作为 baseline 自动注入
 */
export function getLightCrawlers(): LightCrawler[] {
  const crawlers: BaseLightCrawler[] = [
    // API 平台
    new TencentCrawler(),
    new AliyunCrawler(),
    new BaiduCrawler(),
    new VolcengineCrawler(),
    new HuaweiCloudCrawler(),
    new XfyunSparkCrawler(),
    new JdCloudCrawler(),
    new XiaomiCrawler(),
    new UnicomCloudCrawler(),
    new ZhipuAiCrawler(),
    new MinimaxCrawler(),
    new KimiCrawler(),
    new SensenovaCrawler(),
    new KuaishouCrawler(),
    new MthreadsCrawler(),
    new UcloudCrawler(),
    new ZaiCrawler(),
    new OpencodeCrawler(),
    // IDE 平台
    new CursorCrawler(),
    new WindsurfCrawler(),
    new AugmentCodeCrawler(),
    new TraeCrawler(),
    new QoderCnCrawler(),
    new QoderCrawler(),
    new CodebuddyCrawler(),
    new GithubCopilotCrawler(),
    new ClaudeCodeCrawler(),
  ];

  // 注入 seed baseline
  injectBaseline(crawlers);

  return crawlers;
}

/**
 * 获取所有已注册的重量爬虫
 */
export function getHeavyCrawlers(): HeavyCrawler[] {
  // 暂无重量爬虫，如需 Playwright 渲染的页面可在此注册
  return [];
}
