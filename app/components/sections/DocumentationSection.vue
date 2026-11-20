<template>
  <section
    id="docs"
    class="px-6 py-24"
    aria-labelledby="docs-title"
  >
    <div class="container mx-auto max-w-6xl">
      <div class="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h2
            id="docs-title"
            class="text-3xl font-bold tracking-[-0.03em] text-white sm:text-4xl"
          >
            Documentation
          </h2>
          <p class="mt-4 max-w-xl text-gray-400">
            Installation, package management and development guides, written by the community.
          </p>
        </div>

        <!-- Looks like a field, opens the search dialog -->
        <button
          type="button"
          class="flex w-full items-center gap-3 rounded-lg border border-white/15 bg-gray-950/60 px-4 py-3 text-left text-gray-400 transition-colors hover:border-white/30 hover:text-gray-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300 sm:w-80"
          @click="openSearch"
        >
          <Icon
            name="ph:magnifying-glass"
            class="h-5 w-5 shrink-0"
          />
          <span class="flex-1">Search the docs</span>
          <kbd class="hidden rounded-sm border border-gray-700 bg-gray-800 px-2 py-0.5 text-xs text-gray-500 sm:inline-block">{{ shortcutLabel }}</kbd>
        </button>
      </div>

      <ul class="mt-12 grid border-t border-white/10 md:grid-cols-2 md:gap-x-12 lg:grid-cols-3">
        <li
          v-for="section in sections"
          :key="section.path"
          class="border-b border-white/10"
        >
          <NuxtLink
            :to="section.path"
            class="group block py-5"
          >
            <span class="block font-semibold text-white transition-colors group-hover:text-indigo-200">{{ section.title }}</span>
            <span class="mt-1 block text-sm text-gray-400">{{ section.description }}</span>
          </NuxtLink>
        </li>
      </ul>

      <NuxtLink
        to="/docs"
        class="mt-8 inline-block font-medium text-indigo-300 transition-colors hover:text-white"
      >
        Browse all documentation
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
const { open: openSearch } = useSearchDialog()
const shortcutLabel = ref('Ctrl K')

onMounted(() => {
  if (/Mac|iPhone|iPad/.test(navigator.platform)) shortcutLabel.value = '⌘K'
})

// The docs' top-level sections, in sidebar order.
const { data: sections } = await useAsyncData('home-docs-sections', async () => {
  const docs = await queryCollection('docs').select('title', 'description', 'path', 'order').all()
  return docs
    .filter(doc => doc.path.split('/').length === 3)
    .sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity) || a.title.localeCompare(b.title))
}, { default: () => [] })
</script>
