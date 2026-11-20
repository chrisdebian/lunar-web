<template>
  <nav
    aria-label="Documentation"
    class="p-4"
  >
    <NuxtLink
      to="/docs"
      class="mb-4 block text-lg font-semibold text-white hover:text-blue-300"
    >
      Documentation
    </NuxtLink>
    <DocsNavTree
      :items="navigation"
      :current-path="currentPath"
    />
  </nav>
</template>

<script setup lang="ts">
import type { DocNavItem } from '~/composables/useDocsNavigation'

defineProps<{
  navigation: DocNavItem[]
  currentPath: string
}>()
</script>
