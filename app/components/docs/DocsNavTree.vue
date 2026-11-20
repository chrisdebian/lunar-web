<template>
  <ul :class="depth === 0 ? 'space-y-1' : 'ml-3 space-y-1 border-l border-gray-800 pl-2'">
    <li
      v-for="item in items"
      :key="item.path"
    >
      <div class="flex items-center">
        <NuxtLink
          :to="item.path"
          class="flex-1 rounded-sm px-3 py-2 text-sm transition-all"
          :class="item.path === currentPath
            ? 'border-l-2 border-blue-400 bg-blue-600/30 font-semibold text-white'
            : 'text-gray-300 hover:text-white'"
          :aria-current="item.path === currentPath ? 'page' : undefined"
        >
          {{ item.title }}
        </NuxtLink>
        <button
          v-if="item.children.length"
          type="button"
          class="p-2 text-gray-400 transition-colors hover:text-white"
          :aria-expanded="isExpanded(item)"
          :aria-label="`${isExpanded(item) ? 'Collapse' : 'Expand'} ${item.title}`"
          @click="toggle(item)"
        >
          <Icon
            :name="isExpanded(item) ? 'ph:caret-down' : 'ph:caret-right'"
            class="h-4 w-4"
          />
        </button>
      </div>

      <DocsNavTree
        v-if="item.children.length && isExpanded(item)"
        :items="item.children"
        :current-path="currentPath"
        :depth="depth + 1"
      />
    </li>
  </ul>
</template>

<script setup lang="ts">
import type { DocNavItem } from '~/composables/useDocsNavigation'

const props = withDefaults(defineProps<{
  items: DocNavItem[]
  currentPath: string
  depth?: number
}>(), { depth: 0 })

// Explicit user choices; otherwise a section is open when it contains the current page.
const overrides = ref<Record<string, boolean>>({})

const containsCurrent = (item: DocNavItem) =>
  props.currentPath === item.path || props.currentPath.startsWith(`${item.path}/`)

const isExpanded = (item: DocNavItem) => overrides.value[item.path] ?? containsCurrent(item)

const toggle = (item: DocNavItem) => {
  overrides.value[item.path] = !isExpanded(item)
}
</script>
