<template>
  <div class="px-6 pt-10 pb-24">
    <div class="container mx-auto max-w-4xl">
      <Breadcrumb :items="[{ label: 'History', path: '/history' }]" />

      <header class="mt-10 max-w-2xl">
        <h1 class="text-4xl font-bold tracking-[-0.035em] text-balance text-white sm:text-5xl">
          {{ page.headline }}
        </h1>
        <p class="mt-5 text-lg text-pretty text-gray-400">
          {{ page.description }}
        </p>
      </header>

      <!-- Chapters, the family tree and the moonlight calendar are MDC components (components/content) -->
      <ContentRenderer
        :value="page"
        class="history mt-12 prose max-w-[72ch] prose-invert sm:prose-lg
               prose-headings:tracking-tight prose-headings:text-white
               prose-h2:text-2xl sm:prose-h2:text-3xl
               prose-p:text-gray-300 prose-li:text-gray-300 prose-li:marker:text-indigo-300/60
               prose-a:text-indigo-300 prose-a:underline-offset-4 hover:prose-a:text-white
               prose-strong:text-white prose-em:text-indigo-100
               prose-blockquote:border-indigo-400/50 prose-blockquote:text-xl prose-blockquote:font-medium prose-blockquote:text-white prose-blockquote:not-italic
               prose-code:rounded prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:font-normal prose-code:text-indigo-200
               prose-th:text-gray-200 prose-td:text-gray-300
               [&_code::after]:content-none [&_code::before]:content-none"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const { data } = await useAsyncData('history', () => queryCollection('history').first())

if (!data.value) {
  throw createError({ statusCode: 404, statusMessage: 'History page not found', fatal: true })
}

const page = computed(() => data.value!)

usePageSeo({
  title: 'History of Lunar Linux',
  description: page.value.description
})
</script>

<style scoped>
/* Sources close the page quietly, below the story */
.history :deep(#sources) {
  margin-top: 1rem;
  font-size: 1rem;
  color: var(--color-gray-400);
}

.history :deep(#sources ~ p) {
  font-size: 0.9375rem;
  color: var(--color-gray-500);
}

/* The intro paragraph before the first chapter reads as a lede */
.history :deep(> p:first-child) {
  margin-top: 0;
  margin-bottom: 3.5rem;
  font-size: 1.25rem;
  color: var(--color-gray-200);
}
</style>
