<template>
  <div class="rounded-lg border border-gray-700 bg-gray-800/50 p-6">
    <div :class="[iconBg, 'mb-4 flex h-12 w-12 items-center justify-center rounded-full']">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        :class="[iconColor, 'h-6 w-6']"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          :d="icon"
        />
      </svg>
    </div>
    <h3 class="mb-2 text-xl font-semibold">
      {{ title }}
    </h3>
    <p class="text-gray-300">
      {{ description }}
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description: string
  /** SVG path data for the icon. */
  icon: string
  iconBg: string
  iconColor: string
}>()
</script>
