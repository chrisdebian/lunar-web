<template>
  <section class="bg-linear-to-br from-gray-900 to-blue-950 py-20">
    <div class="container mx-auto px-4">
      <div class="mb-10 text-center">
        <h2 class="mb-2 text-3xl font-bold">
          Latest News
        </h2>
        <p class="text-gray-400">
          Stay up to date with the latest Lunar Linux announcements
        </p>
      </div>

      <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="article in articles"
          :key="article.path"
          class="overflow-hidden rounded-lg bg-gray-800 shadow-md transition-transform hover:scale-105"
        >
          <NuxtLink
            :to="article.path"
            class="block p-6"
          >
            <h3 class="mb-2 text-xl font-bold text-white">
              {{ article.title }}
            </h3>
            <time
              :datetime="article.date"
              class="mb-4 block text-sm text-gray-400"
            >{{ formatDate(article.date) }}</time>
            <p class="mb-4 text-gray-300">
              {{ article.description }}
            </p>
            <span class="font-medium text-blue-400">Read more &rarr;</span>
          </NuxtLink>
        </article>

        <p
          v-if="!articles.length"
          class="col-span-full py-8 text-center text-gray-400"
        >
          No news articles yet.
        </p>
      </div>

      <div class="mt-12 text-center">
        <NuxtLink
          to="/news"
          class="rounded-md bg-blue-600 px-6 py-3 font-medium hover:bg-blue-700"
        >
          View all news
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { data: articles } = await useAsyncData('news-latest', () =>
  queryCollection('news').select('title', 'description', 'date', 'path').order('date', 'DESC').limit(3).all(),
{ default: () => [] }
)
</script>
