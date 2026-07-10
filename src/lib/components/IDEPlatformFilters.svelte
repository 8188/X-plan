<script lang="ts">
  let { onFilterChange }: { onFilterChange: (filters: FilterState) => void } = $props();

  interface FilterState {
    search: string;
    accessibility: string;
    sort: string;
    order: 'asc' | 'desc';
  }

  let search = $state('');
  let accessibility = $state('');
  let sort = $state('entry_price');
  let order = $state<'asc' | 'desc'>('asc');

  function emitChange() {
    onFilterChange({ search, accessibility, sort, order });
  }

  function handleSearchInput(e: Event) {
    search = (e.target as HTMLInputElement).value;
    emitChange();
  }

  function handleAccessibilityChange(e: Event) {
    accessibility = (e.target as HTMLSelectElement).value;
    emitChange();
  }

  function handleSortChange(e: Event) {
    sort = (e.target as HTMLSelectElement).value;
    emitChange();
  }

  function toggleOrder() {
    order = order === 'asc' ? 'desc' : 'asc';
    emitChange();
  }
</script>

<div class="panel-card p-3 mb-4">
  <div class="flex flex-col sm:flex-row gap-3">
    <!-- 搜索框 -->
    <div class="flex-1">
      <div class="relative">
        <input
          type="text"
          placeholder="搜索 IDE/Agent 工具名称..."
          value={search}
          oninput={handleSearchInput}
          class="neon-input w-full pl-9"
        />
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style="color: var(--text-soft);">🔍</span>
      </div>
    </div>

    <!-- 可访问性筛选 -->
    <select
      onchange={handleAccessibilityChange}
      class="neon-select"
    >
      <option value="">全部地区</option>
      <option value="domestic">🇨🇳 国内</option>
      <option value="foreign_accessible">🌍 国外可访问</option>
      <option value="foreign_blocked">🔒 国外无法访问</option>
    </select>

    <!-- 排序 -->
    <select
      onchange={handleSortChange}
      class="neon-select"
    >
      <option value="entry_price">按入门价</option>
      <option value="name">按名称</option>
    </select>

    <!-- 排序方向 -->
    <button
      onclick={toggleOrder}
      class="neon-btn"
      title={order === 'asc' ? '升序' : '降序'}
    >
      {order === 'asc' ? '↑ 升序' : '↓ 降序'}
    </button>
  </div>
</div>
