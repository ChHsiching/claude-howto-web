<script setup>
import DefaultTheme from 'vitepress/theme'
import CopyPage from './CopyPage.vue'

const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
    <template #doc-before>
      <div class="doc-title-row">
        <CopyPage />
      </div>
    </template>
  </Layout>
</template>

<style scoped>
.doc-title-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-bottom: -8px;
  padding-right: 4px;
}
</style>
