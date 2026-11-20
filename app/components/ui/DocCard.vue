<template>
  <NuxtLink
    :to="to"
    class="group block rounded-lg border border-gray-700 bg-gray-800/50 p-6 transition-colors hover:border-indigo-400/60"
  >
    <h3 class="mb-3 text-xl font-semibold">
      {{ title }}
    </h3>
    <p class="mb-4 text-gray-300">
      {{ description }}
    </p>
    <span class="inline-flex items-center text-indigo-300 transition-colors group-hover:text-indigo-200">
      Read guide
      <Icon
        name="ph:caret-right"
        class="ml-1 h-4 w-4"
      />
    </span>
  </NuxtLink>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description: string
  to: string
}>()
</script>
