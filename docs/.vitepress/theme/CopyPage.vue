<script setup>
import { ref } from 'vue'
import { useData } from 'vitepress'

const { frontmatter } = useData()
const copied = ref(false)

async function copyPage() {
  try {
    const src = frontmatter.value.markdownSrc
    if (!src) return
    await navigator.clipboard.writeText(src)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch (e) {
    console.error('Failed to copy:', e)
  }
}
</script>

<template>
  <button
    class="copy-page-btn"
    :class="{ copied }"
    :title="copied ? 'Copied!' : 'Copy page'"
    @click="copyPage"
  >
    <svg v-if="!copied" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="5.25" y="1.25" width="9.5" height="12.5" rx="2" />
      <path d="M10.75 14.75H5.25a2 2 0 0 1-2-2V4.5" />
      <path d="M3.25 1.25a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h2.5" />
    </svg>
    <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M2.5 8.5l4 4 7-7" />
    </svg>
    <span>{{ copied ? 'Copied' : 'Copy' }}</span>
  </button>
</template>

<style scoped>
.copy-page-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s;
  white-space: nowrap;
}

.copy-page-btn:hover {
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}

.copy-page-btn.copied {
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}
</style>
