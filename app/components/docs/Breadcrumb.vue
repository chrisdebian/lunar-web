<template>
  <nav
    aria-label="Breadcrumb"
    class="mb-6"
  >
    <ol class="flex flex-wrap items-center gap-y-1 text-sm">
      <li
        v-for="(item, index) in breadcrumbs"
        :key="item.path"
        class="flex items-center"
      >
        <NuxtLink
          v-if="index < breadcrumbs.length - 1"
          :to="item.path"
          class="text-gray-400 transition-colors hover:text-white"
        >
          {{ item.label }}
        </NuxtLink>
        <span
          v-else
          class="font-medium text-white"
          aria-current="page"
        >
          {{ item.label }}
        </span>
        <Icon
          v-if="index < breadcrumbs.length - 1"
          name="ph:caret-right"
          class="mx-2 h-4 w-4 text-gray-600"
        />
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
import type { DocNavItem } from '~/composables/useDocsNavigation'

type BreadcrumbItem = {
  label: string
  path: string
}

const props = defineProps<{
  currentPath: string
  currentTitle?: string
  navigation?: DocNavItem[]
}>()

// Page titles by path, so intermediate crumbs show "Package Management" rather than the URL slug.
const titles = computed(() => {
  const map = new Map<string, string>()
  const walk = (items: DocNavItem[]) => items.forEach((item) => {
    map.set(item.path, item.title)
    walk(item.children)
  })
  walk(props.navigation ?? [])
  return map
})

const humanize = (slug: string) =>
  slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')

const breadcrumbs = computed(() => {
  const items: BreadcrumbItem[] = [{ label: 'Documentation', path: '/docs' }]
  const segments = props.currentPath.split('/').filter(Boolean).slice(1) // drop "docs"

  let path = '/docs'
  segments.forEach((segment, index) => {
    path += `/${segment}`
    const isLast = index === segments.length - 1
    const label = (isLast && props.currentTitle) || titles.value.get(path) || humanize(segment)
    items.push({ label, path })
  })

  return items
})
</script>
