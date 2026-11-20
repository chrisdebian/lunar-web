<template>
  <div class="container mx-auto px-4 py-8 pb-12">
    <NuxtLink
      to="/news"
      class="mb-8 inline-flex items-center text-blue-400 transition-colors hover:text-blue-300"
    >
      <span class="mr-2">&larr;</span> Back to news
    </NuxtLink>

    <div class="mx-auto max-w-4xl">
      <header class="mb-12">
        <h1 class="mb-4 text-4xl leading-tight font-bold text-white md:text-5xl">
          {{ article.title }}
        </h1>
        <div class="flex items-center text-lg text-gray-400">
          <Icon
            name="ph:calendar-blank"
            class="mr-2 h-5 w-5"
          />
          <time :datetime="article.date">{{ formatDate(article.date) }}</time>
        </div>
      </header>

      <article class="rounded-2xl border border-gray-700/50 bg-gray-800/50 p-8 shadow-2xl backdrop-blur-xs md:p-12">
        <ContentRenderer
          :value="article"
          class="prose prose-lg max-w-none prose-invert
                 prose-headings:mt-8 prose-headings:mb-4 prose-headings:font-bold prose-headings:text-white
                 prose-h2:border-b prose-h2:border-gray-700 prose-h2:pb-3 prose-h2:text-3xl
                 prose-h3:text-2xl
                 prose-p:mb-6 prose-p:leading-relaxed prose-p:text-gray-300
                 prose-a:text-blue-400 prose-a:no-underline hover:prose-a:text-blue-300 hover:prose-a:underline
                 prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:text-gray-400 prose-blockquote:italic
                 prose-strong:font-semibold prose-strong:text-blue-400
                 prose-code:rounded-sm prose-code:bg-gray-900 prose-code:px-2 prose-code:py-1 prose-code:text-blue-300
                 prose-pre:border prose-pre:border-gray-700 prose-pre:bg-gray-900
                 prose-ul:my-6 prose-ul:space-y-3
                 prose-li:leading-relaxed prose-li:text-gray-300
                 prose-hr:my-8 prose-hr:border-gray-700"
        />
      </article>

      <div class="mt-8">
        <NuxtLink
          to="/news"
          class="inline-flex items-center text-blue-400 transition-colors hover:text-blue-300"
        >
          <span class="mr-2">&larr;</span> Back to all news
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { withoutTrailingSlash } from 'ufo'

const route = useRoute()
const path = withoutTrailingSlash(route.path)

const { data } = await useAsyncData(`news:${path}`, () =>
  queryCollection('news').path(path).first()
)

if (!data.value) {
  throw createError({ statusCode: 404, statusMessage: 'Article not found', fatal: true })
}

const article = computed(() => data.value!)

usePageSeo({
  title: article.value.title,
  description: article.value.description,
  type: 'article'
})
</script>
