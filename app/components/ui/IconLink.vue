<template>
  <li>
    <NuxtLink
      v-if="href.startsWith('/')"
      :to="href"
      :class="linkClass"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="mr-2 h-5 w-5 shrink-0"
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
      {{ text }}
    </NuxtLink>
    <a
      v-else
      :href="href"
      :class="linkClass"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="mr-2 h-5 w-5 shrink-0"
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
      {{ text }}
    </a>
  </li>
</template>

<script setup lang="ts">
/** A list item link with a 24x24 outline icon. Paths starting with `/` are router links. */
defineProps<{
  text: string
  href: string
  /** SVG path data for the icon. */
  icon: string
}>()

const linkClass = 'flex items-center text-indigo-300 transition-colors hover:text-indigo-200'
</script>
