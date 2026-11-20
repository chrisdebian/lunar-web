<template>
  <div class="container mx-auto max-w-4xl px-4 py-12">
    <div class="mb-12 text-center">
      <h1 class="mb-4 text-4xl font-bold">
        Lunar Linux News
      </h1>
      <p class="mx-auto max-w-3xl text-xl text-gray-300">
        Announcements, releases and updates from the Lunar Linux team.
      </p>
      <a
        :href="withBase('/rss.xml')"
        class="mt-3 inline-flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-gray-300"
      >
        <Icon
          name="ph:rss-bold"
          class="h-4 w-4"
        />
        Subscribe via RSS
      </a>
    </div>

    <div class="space-y-6">
      <article
        v-for="article in paginatedArticles"
        :key="article.path"
        class="overflow-hidden rounded-lg border border-gray-700/50 bg-gray-800/50 shadow-lg backdrop-blur-xs transition-all hover:bg-gray-800/70"
      >
        <NuxtLink
          :to="article.path"
          class="block p-6"
        >
          <h2 class="mb-2 text-2xl font-bold text-white">
            {{ article.title }}
          </h2>
          <time
            :datetime="article.date"
            class="mb-4 block text-sm text-gray-400"
          >{{ formatDate(article.date) }}</time>
          <p class="mb-4 line-clamp-2 text-gray-300">
            {{ article.description }}
          </p>
          <span class="font-medium text-blue-400 transition-colors hover:text-blue-300">Read more &rarr;</span>
        </NuxtLink>
      </article>

      <p
        v-if="!articles.length"
        class="py-8 text-center text-gray-400"
      >
        No news articles yet.
      </p>
    </div>

    <nav
      v-if="totalPages > 1"
      aria-label="Pagination"
      class="mt-12 flex items-center justify-center gap-2"
    >
      <button
        type="button"
        :disabled="currentPage === 1"
        class="rounded-lg bg-gray-800 px-4 py-2 text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
        @click="currentPage--"
      >
        Previous
      </button>
      <button
        v-for="pageNumber in totalPages"
        :key="pageNumber"
        type="button"
        :aria-current="currentPage === pageNumber ? 'page' : undefined"
        :class="[
          'rounded-lg px-4 py-2 transition-colors',
          currentPage === pageNumber ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
        ]"
        @click="currentPage = pageNumber"
      >
        {{ pageNumber }}
      </button>
      <button
        type="button"
        :disabled="currentPage === totalPages"
        class="rounded-lg bg-gray-800 px-4 py-2 text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
        @click="currentPage++"
      >
        Next
      </button>
    </nav>
  </div>
</template>

<script setup lang="ts">
const ARTICLES_PER_PAGE = 10

const { withBase } = useSiteLinks()

const { data: articles } = await useAsyncData('news-list', () =>
  queryCollection('news').select('title', 'description', 'date', 'path').order('date', 'DESC').all(),
{ default: () => [] }
)

const currentPage = ref(1)
const totalPages = computed(() => Math.ceil(articles.value.length / ARTICLES_PER_PAGE))
const paginatedArticles = computed(() =>
  articles.value.slice((currentPage.value - 1) * ARTICLES_PER_PAGE, currentPage.value * ARTICLES_PER_PAGE)
)

usePageSeo({
  title: 'News',
  description: 'Latest news, announcements and updates from the Lunar Linux team'
})
</script>
