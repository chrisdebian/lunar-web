<template>
  <section
    v-if="articles.length"
    class="mt-12 border-t border-gray-800 pt-8"
  >
    <h2 class="text-xl font-semibold text-white">
      Related articles
    </h2>
    <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <NuxtLink
        v-for="doc in articles"
        :key="doc.path"
        :to="doc.path"
        class="group rounded-lg border border-gray-800 bg-gray-900/50 p-4 transition-all hover:border-blue-500 hover:bg-gray-900"
      >
        <div
          v-if="doc.category"
          class="text-xs tracking-wide text-blue-400 uppercase"
        >
          {{ doc.category }}
        </div>
        <h3 class="mt-2 font-semibold text-white group-hover:text-blue-400">
          {{ doc.title }}
        </h3>
        <p class="mt-1 line-clamp-2 text-sm text-gray-400">
          {{ doc.description }}
        </p>
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
export type RelatedDoc = {
  title: string
  description: string
  path: string
  category?: string
}

defineProps<{ articles: RelatedDoc[] }>()
</script>
