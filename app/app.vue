<template>
  <div class="min-h-screen w-full bg-linear-to-br from-gray-950 via-gray-900 to-blue-950 font-sans text-gray-100">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
const { indexable } = useRuntimeConfig().public

useHead({
  titleTemplate: title => (title ? `${title} · Lunar Linux` : 'Lunar Linux · A Source-Based Linux Distribution'),
  meta: indexable ? [] : [{ name: 'robots', content: 'noindex' }]
})
</script>
