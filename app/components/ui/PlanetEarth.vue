<!-- A small, filter-free Earth (decorative). Lit from the upper left, like the hero moon. -->
<template>
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
  >
    <defs>
      <radialGradient
        :id="`${id}-ocean`"
        cx="35%"
        cy="30%"
        r="75%"
      >
        <stop
          offset="0"
          stop-color="#60A5FA"
        />
        <stop
          offset="0.6"
          stop-color="#2563EB"
        />
        <stop
          offset="1"
          stop-color="#1E1B4B"
        />
      </radialGradient>
      <clipPath :id="`${id}-disc`">
        <circle
          cx="12"
          cy="12"
          r="10"
        />
      </clipPath>
    </defs>
    <circle
      cx="12"
      cy="12"
      r="10"
      :fill="`url(#${id}-ocean)`"
    />
    <!-- Continents -->
    <g
      :clip-path="`url(#${id}-disc)`"
      fill="#6EE7B7"
      fill-opacity="0.75"
    >
      <path d="M5 7.5c1.6-1.8 4-2.3 5.2-1.2.9.8-.1 2 .9 2.9 1 .9 2.6.3 2.9 1.5.3 1.4-1.6 2-2.9 2.6-1.4.6-1.3 2.3-2.6 2.6C6.9 16.2 5.6 14.4 4.9 13c-.8-1.7-1.3-3.9.1-5.5Z" />
      <path d="M15.6 4.6c1.6.2 3.3 1.3 4.1 2.6.4.7-.4 1.3-1.2 1.1-1-.3-1.6-1-2.6-1-.9 0-1.6-.6-1.4-1.4.1-.6.5-1.3 1.1-1.3Z" />
      <path d="M16.4 13.4c1.2-.5 2.9-.2 3.4.9.5 1.2-.4 2.7-1.4 3.6-1 .9-2.3 1.4-2.9.6-.6-.8.3-1.7 0-2.7-.3-1 0-2 .9-2.4Z" />
    </g>
    <!-- Night side -->
    <circle
      cx="12"
      cy="12"
      r="10"
      :fill="`url(#${id}-shade)`"
    />
    <defs>
      <radialGradient
        :id="`${id}-shade`"
        cx="30%"
        cy="25%"
        r="95%"
      >
        <stop
          offset="0.55"
          stop-color="#0C0F25"
          stop-opacity="0"
        />
        <stop
          offset="1"
          stop-color="#0C0F25"
          stop-opacity="0.7"
        />
      </radialGradient>
    </defs>
    <!-- Atmosphere -->
    <circle
      cx="12"
      cy="12"
      r="10.4"
      fill="none"
      stroke="#93C5FD"
      stroke-opacity="0.35"
      stroke-width="0.6"
    />
  </svg>
</template>

<script setup lang="ts">
// Unique ids, so several Earths on a page don't share gradients.
const id = useId()
</script>
