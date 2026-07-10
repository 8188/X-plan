<script lang="ts">
  import '../app.css';

  let { children } = $props();
</script>

<div class="min-h-screen">
  <!-- 顶部导航 -->
  <nav class="sticky top-0 z-50 backdrop-blur-md border-b nav-glow" style="background: rgba(5, 9, 15, 0.82); border-color: var(--line);">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-14">
        <a href="/" class="flex items-center gap-2 no-underline">
          <span class="text-2xl">📊</span>
          <span style="font-family: 'Orbitron', sans-serif; font-weight: 700; font-size: 1.25rem; background: linear-gradient(135deg, var(--brand), var(--brand-2)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
            X-Plan
          </span>
        </a>
        <div class="flex items-center gap-5">
          <a href="/" class="text-sm font-medium transition-colors no-underline" style="color: var(--text-soft);">API 对比</a>
          <a href="/ide" class="text-sm font-medium transition-colors no-underline" style="color: var(--text-soft);">IDE/Agent</a>
          <a href="/ping" class="text-sm font-medium transition-colors no-underline" style="color: var(--text-soft);">测速</a>
          <a href="/about" class="text-sm font-medium transition-colors no-underline" style="color: var(--text-soft);">关于</a>
        </div>
      </div>
    </div>
  </nav>

  <!-- 主内容 -->
  <main>
    {@render children()}
  </main>

  <!-- 页脚 -->
  <footer class="mt-16 border-t" style="border-color: var(--line); background: rgba(5, 9, 15, 0.6);">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm" style="color: var(--text-soft);">
        <p>© 2026 X-Plan — 国内 Coding Plan 对比平台</p>
        <p>数据仅供参考，请以各平台官网为准</p>
      </div>
    </div>
  </footer>
</div>
