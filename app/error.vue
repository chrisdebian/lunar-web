<template>
  <div class="min-h-screen w-full bg-linear-to-br from-gray-950 via-gray-900 to-blue-950 font-sans text-gray-100">
    <NuxtLayout>
      <div class="container mx-auto px-4 py-24">
        <div class="mx-auto max-w-2xl rounded-2xl border border-gray-700/50 bg-gray-800/50 p-12 text-center">
          <p class="mb-2 text-sm font-semibold tracking-wide text-blue-400 uppercase">
            Error {{ error.statusCode }}
          </p>
          <h1 class="mb-4 text-4xl font-bold">
            {{ isNotFound ? 'Page not found' : 'Something went wrong' }}
          </h1>
          <p class="mb-8 text-gray-400">
            {{ isNotFound ? "The page you're looking for doesn't exist or has moved." : error.message }}
          </p>
          <button
            class="rounded-lg bg-blue-600 px-6 py-3 font-semibold transition-colors hover:bg-blue-700"
            @click="clearError({ redirect: '/' })"
          >
            Return home
          </button>
        </div>
      </div>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const isNotFound = computed(() => props.error.statusCode === 404)

useHead({
  title: () => (isNotFound.value ? 'Page not found' : 'Error'),
  meta: [{ name: 'robots', content: 'noindex' }]
})
</script>
