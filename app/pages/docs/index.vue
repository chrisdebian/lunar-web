<template>
  <div class="container mx-auto max-w-6xl px-4 py-12 sm:px-8">
    <header class="mb-8">
      <h1 class="text-4xl font-bold text-white">
        {{ page?.title ?? 'Documentation' }}
      </h1>
      <p
        v-if="page?.description"
        class="mt-2 text-lg text-gray-400"
      >
        {{ page.description }}
      </p>
    </header>

    <ContentRenderer
      v-if="page"
      :value="page"
      class="prose max-w-none prose-invert prose-a:text-blue-400 hover:prose-a:text-blue-300"
    />

    <div class="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <NuxtLink
        v-for="section in sections"
        :key="section.path"
        :to="section.path"
        class="group rounded-lg border border-gray-800 bg-gray-900/50 p-6 transition-all hover:border-blue-500 hover:bg-gray-900"
      >
        <h2 class="text-xl font-semibold text-white group-hover:text-blue-400">
          {{ section.title }}
        </h2>
        <p class="mt-2 text-sm text-gray-400">
          {{ section.description }}
        </p>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const { data: page } = await useAsyncData('docs:/docs', () =>
  queryCollection('docs').path('/docs').first()
)

// Top-level pages and sections (/docs/<name>), ordered like the sidebar.
const { data: sections } = await useAsyncData('docs-sections', async () => {
  const docs = await queryCollection('docs').select('title', 'description', 'path', 'order').all()
  return docs
    .filter(doc => doc.path.split('/').length === 3)
    .sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity) || a.title.localeCompare(b.title))
}, { default: () => [] })

usePageSeo({
  title: 'Documentation',
  description: page.value?.description ?? 'Documentation for the Lunar Linux distribution'
})
</script>
