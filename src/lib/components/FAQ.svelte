<script lang="ts">
  import { slide } from 'svelte/transition';
  import type { FAQ as FAQType } from '$lib/db/types';

  let { faqs }: { faqs: FAQType[] } = $props();
  let openIndex = $state<number | null>(null);

  function toggle(index: number) {
    openIndex = openIndex === index ? null : index;
  }
</script>

<div class="space-y-3">
  {#each faqs as faq, index}
    <div class="faq-item">
      <button
        class="w-full px-5 py-4 text-left flex items-center justify-between transition-colors"
        style="color: var(--text);"
        onclick={() => toggle(index)}
      >
        <span class="font-medium text-sm">{faq.question}</span>
        <span class="ml-4" style="color: var(--text-soft);">{openIndex === index ? '▲' : '▼'}</span>
      </button>
      {#if openIndex === index}
        <div transition:slide={{ duration: 200 }} class="px-5 pb-4">
          <p class="text-sm leading-relaxed" style="color: var(--text-soft);">{faq.answer}</p>
        </div>
      {/if}
    </div>
  {/each}
</div>
