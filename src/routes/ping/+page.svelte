<script lang="ts">
  import { getPlatformIcon, getPlatformInitial } from '$lib/icons';

  interface PingTarget {
    name: string;
    slug: string;
    region: string;
    service: string;
    url: string;
  }

  interface PingResult {
    target: PingTarget;
    samples: number[];
    avg: number | null;
    min: number | null;
    max: number | null;
    jitter: number | null;
    status: 'idle' | 'testing' | 'done' | 'error';
    rank: number;
  }

  const PING_COUNT = 5;

  const pingTargets: PingTarget[] = [
    { name: '腾讯云', slug: 'tencent-cloud', region: '国内', service: 'Hy Token Plan', url: 'https://api.lkeap.cloud.tencent.com/plan/v3' },
    { name: '阿里云百炼', slug: 'aliyun-bailian', region: '国内', service: '百炼 Token Plan', url: 'https://token-plan.cn-beijing.maas.aliyuncs.com/compatible-mode/v1' },
    { name: '百度千帆', slug: 'baidu-cloud', region: '国内', service: '千帆 Coding Plan', url: 'https://qianfan.baidubce.com/v1' },
    { name: '火山引擎', slug: 'volcengine', region: '国内', service: '火山方舟 Coding Plan', url: 'https://ark.cn-beijing.volces.com/api/coding/v3' },
    { name: '讯飞星辰', slug: 'xfyun-spark', region: '国内', service: 'Astron Coding Plan', url: 'https://spark-api-open.xf-yun.com/v1/chat/completions' },
    { name: '京东云', slug: 'jd-cloud', region: '国内', service: 'JoyBuilder Coding Plan', url: 'https://www.jdcloud.com/cn/pages/codingplan' },
    { name: '小米', slug: 'xiaomi', region: '国内', service: 'MiMo Token Plan', url: 'https://platform.xiaomimimo.com/token-plan' },
    { name: '联通云', slug: 'unicom-cloud', region: '国内', service: '元景 Token Plan', url: 'https://www.cucloud.cn/product/tokenplan.html' },
    { name: '智谱AI', slug: 'zhipu-ai', region: '国内', service: 'GLM Coding Plan', url: 'https://open.bigmodel.cn/api/coding/paas/v4' },
    { name: 'MiniMax', slug: 'minimax', region: '国内', service: 'MiniMax Token Plan', url: 'https://api.minimaxi.com/v1' },
    { name: 'Kimi', slug: 'kimi', region: '国内', service: 'Kimi Code Plan', url: 'https://api.moonshot.cn/v1' },
    { name: '商汤日日新', slug: 'sensenova', region: '国内', service: 'SenseNova Token Plan', url: 'https://api.sensenova.cn/v1' },
    { name: '无问芯穹', slug: 'infini-ai', region: '国内', service: 'Infini Coding Plan', url: 'https://cloud.infini-ai.com/' },
    { name: '快手', slug: 'kuaishou', region: '国内', service: 'KwaiKAT Coding Plan', url: 'https://www.streamlake.com/marketing/coding-plan' },
    { name: '摩尔线程', slug: 'mthreads', region: '国内', service: 'AI Coding Plan', url: 'https://code.mthreads.com/' },
    { name: 'UCloud 优刻得', slug: 'ucloud', region: '国内', service: '优云智算 Agent Plan', url: 'https://www.compshare.cn/coding-plan' },
    { name: 'Z.ai', slug: 'z-ai', region: '国外', service: 'GLM Plan (国际版)', url: 'https://api.z.ai/api/coding/paas/v4' },
    { name: 'OpenCode', slug: 'opencode', region: '国外', service: 'OpenCode Go', url: 'https://opencode.ai/zen/go/v1/chat/completions' },
  ];

  let results = $state<PingResult[]>(
    pingTargets.map(t => ({ target: t, samples: [], avg: null, min: null, max: null, jitter: null, status: 'idle', rank: 0 }))
  );
  let testing = $state(false);
  let progress = $state('');

  let sortedResults = $derived(
    [...results].sort((a, b) => {
      if (a.status === 'done' && b.status !== 'done') return -1;
      if (a.status !== 'done' && b.status === 'done') return 1;
      if (a.status === 'done' && b.status === 'done') return (a.rank || 999) - (b.rank || 999);
      return 0;
    })
  );

  async function pingOnce(url: string): Promise<number> {
    const start = performance.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      await fetch(url, { method: 'HEAD', mode: 'no-cors', signal: controller.signal });
    } finally {
      clearTimeout(timeout);
    }
    return Math.round(performance.now() - start);
  }

  async function runPing() {
    testing = true;
    progress = '准备测试...';
    results = pingTargets.map(t => ({ target: t, samples: [], avg: null, min: null, max: null, jitter: null, status: 'idle', rank: 0 }));

    let completed = 0;
    const total = pingTargets.length;

    const promises = results.map(async (r, i) => {
      results[i] = { ...results[i], status: 'testing' };
      const samples: number[] = [];

      for (let j = 0; j < PING_COUNT; j++) {
        try {
          const latency = await pingOnce(r.target.url);
          samples.push(latency);
          results[i] = { ...results[i], samples: [...samples] };
        } catch {
          // skip failed sample
        }
        if (j < PING_COUNT - 1) {
          await new Promise(res => setTimeout(res, 200));
        }
      }

      completed++;
      progress = `${completed}/${total}`;

      if (samples.length === 0) {
        results[i] = { ...results[i], status: 'error', samples: [] };
      } else {
        const avg = Math.round(samples.reduce((a, b) => a + b, 0) / samples.length);
        const min = Math.min(...samples);
        const max = Math.max(...samples);

        let jitter: number | null = null;
        if (samples.length >= 2) {
          let diffSum = 0;
          for (let k = 1; k < samples.length; k++) {
            diffSum += Math.abs(samples[k] - samples[k - 1]);
          }
          jitter = Math.round(diffSum / (samples.length - 1));
        }

        results[i] = { ...results[i], samples, avg, min, max, jitter, status: 'done' };
      }
    });

    await Promise.all(promises);

    const doneResults = results
      .filter(r => r.status === 'done' && r.avg !== null)
      .sort((a, b) => (a.avg ?? Infinity) - (b.avg ?? Infinity));

    doneResults.forEach((r, rank) => {
      const idx = results.findIndex(x => x.target.url === r.target.url);
      if (idx !== -1) {
        results[idx] = { ...results[idx], rank: rank + 1 };
      }
    });

    progress = '';
    testing = false;
  }

  function getLatencyColor(ms: number | null): string {
    if (ms === null) return 'color: var(--text-soft);';
    if (ms < 200) return 'color: var(--brand-2);';
    if (ms < 500) return 'color: #facc15;';
    if (ms < 1000) return 'color: #fb923c;';
    return 'color: var(--danger);';
  }

  function getRowBg(ms: number | null): string {
    if (ms === null) return '';
    if (ms < 200) return 'background: rgba(0, 255, 156, 0.04);';
    if (ms < 500) return 'background: rgba(250, 204, 21, 0.04);';
    if (ms < 1000) return 'background: rgba(251, 146, 60, 0.04);';
    return 'background: rgba(255, 84, 123, 0.04);';
  }

  let copiedUrl = $state('');
  let copyTimeout: ReturnType<typeof setTimeout>;

  function handleCopy(url: string) {
    navigator.clipboard.writeText(url);
    copiedUrl = url;
    clearTimeout(copyTimeout);
    copyTimeout = setTimeout(() => { copiedUrl = ''; }, 1500);
  }
</script>

<svelte:head>
  <title>AI Coding Plan API 测速 | X-Plan — 各平台 API 延迟实时测试</title>
  <meta name="description" content="实时测试各 AI 编程助手平台 API 接口延迟，涵盖腾讯云、阿里云、百度千帆等 19 个接口，统计平均/最低/最高延迟与抖动" />
  <meta property="og:title" content="AI Coding Plan API 测速 | X-Plan" />
  <meta property="og:description" content="实时测试各 AI 编程助手平台 API 接口延迟" />
  <meta property="og:url" content="https://x-plan.pages.dev/ping" />
  <link rel="canonical" href="https://x-plan.pages.dev/ping" />
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
  <div class="hero-block">
    <h1>Coding Plan API 测速</h1>
    <p>HTTP Ping · {pingTargets.length} 个接口 · 每接口 {PING_COUNT} 次采样</p>
    <p>基于浏览器 HTTP 请求时延测量各平台 API 接口延迟，结果受本地网络环境影响仅作参考</p>
  </div>

  <!-- 控制栏 -->
  <div class="flex items-center gap-3 mb-4">
    <button
      class="neon-btn px-4 py-1.5 font-medium"
      style="background: rgba(49, 213, 255, 0.15); border-color: var(--brand); color: var(--brand);"
      onclick={runPing}
      disabled={testing}
    >
      {testing ? `测试中 ${progress}...` : '开始测试'}
    </button>
  </div>

  <!-- 结果表格 -->
  <div class="panel-card overflow-hidden">
    <div class="overflow-x-auto">
      <table class="neon-table">
        <thead>
          <tr>
            <th class="text-center w-12">排名</th>
            <th class="text-left">平台</th>
            <th class="text-left">接口地址</th>
            <th class="text-right w-16">平均</th>
            <th class="text-right w-16">最低</th>
            <th class="text-right w-16">最高</th>
            <th class="text-right w-16">抖动</th>
            <th class="text-right w-16">延迟</th>
          </tr>
        </thead>
        <tbody>
          {#each sortedResults as result (result.target.url)}
            <tr style={getRowBg(result.avg)}>
              <!-- 排名 -->
              <td class="text-center">
                {#if result.status === 'testing'}
                  <div class="animate-spin inline-block w-3.5 h-3.5 border-2 rounded-full" style="border-color: var(--brand); border-top-color: transparent;"></div>
                {:else if result.status === 'done' && result.rank > 0}
                  <span class="font-bold" style="color: {result.rank <= 3 ? 'var(--brand)' : 'var(--text-soft)'};">#{result.rank}</span>
                {:else if result.status === 'error'}
                  <span style="color: var(--danger);">✗</span>
                {:else}
                  <span style="color: rgba(89, 126, 158, 0.3);">-</span>
                {/if}
              </td>

              <!-- 平台 -->
              <td>
                <div class="flex items-center gap-1.5">
                  {#if getPlatformIcon(result.target.slug)}
                    <img src={getPlatformIcon(result.target.slug)} alt="" class="w-4 h-4 rounded-sm shrink-0" loading="lazy" onerror={(e) => {(e.target as HTMLImageElement).style.display='none'}} />
                  {:else}
                    <span class="inline-flex items-center justify-center w-4 h-4 rounded-sm text-[10px] font-bold shrink-0" style="background: rgba(89, 126, 158, 0.2); color: var(--text-soft);">{getPlatformInitial(result.target.name)}</span>
                  {/if}
                  <a
                    href="/#{result.target.slug}"
                    class="font-medium no-underline"
                    style="color: var(--brand);"
                  >{result.target.name}</a>
                  <span class="badge badge-domestic">{result.target.region}</span>
                  <span class="hidden lg:inline" style="color: var(--text-soft);">{result.target.service}</span>
                </div>
              </td>

              <!-- 接口地址 -->
              <td>
                <div class="flex items-center gap-1">
                  <code class="text-[11px] truncate max-w-[240px]" style="color: var(--text-soft);">{result.target.url}</code>
                  <button
                    class="shrink-0 p-0.5 rounded transition-colors neon-btn"
                    style="padding: 2px 4px; font-size: 10px;"
                    onclick={() => handleCopy(result.target.url)}
                    title="复制"
                  >
                    {#if copiedUrl === result.target.url}
                      <span style="color: var(--brand-2);">✓</span>
                    {:else}
                      <span>📋</span>
                    {/if}
                  </button>
                </div>
              </td>

              <!-- 平均 -->
              <td class="text-right">
                {#if result.avg !== null}
                  <span class="font-medium" style={getLatencyColor(result.avg)}>{result.avg}<span style="color: var(--text-soft);">ms</span></span>
                {:else if result.status === 'testing'}
                  <span style="color: rgba(89, 126, 158, 0.3);">…</span>
                {:else}
                  <span style="color: rgba(89, 126, 158, 0.3);">-</span>
                {/if}
              </td>

              <!-- 最低 -->
              <td class="text-right">
                {#if result.min !== null}
                  <span style="color: var(--brand-2);">{result.min}</span>
                {:else}
                  <span style="color: rgba(89, 126, 158, 0.3);">-</span>
                {/if}
              </td>

              <!-- 最高 -->
              <td class="text-right">
                {#if result.max !== null}
                  <span style="color: {result.max > 1000 ? 'var(--danger)' : '#fb923c'};">{result.max}</span>
                {:else}
                  <span style="color: rgba(89, 126, 158, 0.3);">-</span>
                {/if}
              </td>

              <!-- 抖动 -->
              <td class="text-right">
                {#if result.jitter !== null}
                  <span style="color: {result.jitter > 100 ? 'var(--danger)' : result.jitter > 50 ? '#fb923c' : 'var(--text-soft)'};">{result.jitter}</span>
                {:else}
                  <span style="color: rgba(89, 126, 158, 0.3);">-</span>
                {/if}
              </td>

              <!-- 延迟 (最近一次采样) -->
              <td class="text-right">
                {#if result.samples.length > 0}
                  <span style={getLatencyColor(result.samples[result.samples.length - 1])}>{result.samples[result.samples.length - 1]}</span>
                {:else}
                  <span style="color: rgba(89, 126, 158, 0.3);">-</span>
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    {#if !testing && results.every(r => r.status === 'idle')}
      <div class="py-8 text-center" style="color: var(--text-soft);">
        <p class="text-sm">点击"开始测试"测量各平台 API 延迟</p>
      </div>
    {/if}
  </div>

  <!-- 说明 -->
  <div class="mt-4 text-xs space-y-0.5" style="color: var(--text-soft);">
    <p>• 每个 endpoint 测试 {PING_COUNT} 次，间隔 200ms，统计平均/最低/最高/抖动</p>
    <p>• 抖动 = 相邻两次延迟差的平均值；延迟 = 最近一次采样值</p>
    <p>• 使用 <code>fetch(mode: no-cors)</code> 测量 HTTP 往返时延，仅反映网络延迟</p>
    <p>• &lt;200ms 绿色 · 200-500ms 黄色 · 500-1000ms 橙色 · &gt;1000ms 红色</p>
    <p>• 结果受本地网络环境、DNS 解析等因素影响，仅供参考</p>
  </div>
</div>
