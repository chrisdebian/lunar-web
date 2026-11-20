<template>
  <div class="min-h-screen w-full bg-linear-to-br from-gray-950 via-gray-900 to-blue-950 font-sans text-gray-100">
    <NuxtLayout>
      <div class="container mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 md:min-h-[calc(100svh-14rem)] md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div class="order-2 md:order-1">
          <h1 class="text-4xl leading-[1.1] font-bold tracking-[-0.035em] text-balance text-white sm:text-5xl">
            {{ isNotFound ? 'This page has drifted out of orbit.' : 'Something went wrong.' }}
          </h1>
          <p class="mt-6 max-w-md text-lg text-gray-300">
            <template v-if="isNotFound">
              The page you're looking for doesn't exist or has moved. Head back home, or search the documentation.
            </template>
            <template v-else>
              {{ error.message || 'Please try again in a moment.' }}
            </template>
          </p>
          <div class="mt-10 flex flex-wrap gap-4">
            <button
              type="button"
              class="rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white shadow-lg shadow-indigo-950/50 transition-colors hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300"
              @click="clearError({ redirect: '/' })"
            >
              Back to the homepage
            </button>
            <button
              v-if="isNotFound"
              type="button"
              class="rounded-lg border border-white/15 px-6 py-3 font-medium text-gray-100 transition-colors hover:border-white/30 hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300"
              @click="openSearch"
            >
              Search the docs
            </button>
          </div>
          <p class="mt-8 text-sm text-gray-500">
            Error {{ error.statusCode }}
          </p>
        </div>

        <!-- A small night scene: the moon, a few stars and a satellite slowly crossing once -->
        <div
          class="scene relative order-1 mx-auto aspect-square w-56 sm:w-72 md:order-2 md:w-96"
          aria-hidden="true"
        >
          <span
            v-for="(star, index) in stars"
            :key="index"
            class="absolute rounded-full bg-indigo-100"
            :style="{ left: `${star.x}%`, top: `${star.y}%`, width: `${star.size}px`, height: `${star.size}px`, opacity: star.o }"
          />
          <LunarMoon class="absolute inset-[12%]" />
          <span class="satellite" />
        </div>
      </div>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const isNotFound = computed(() => props.error.statusCode === 404)
const { open: openSearch } = useSearchDialog()

const stars = [
  { x: 6, y: 18, size: 2, o: 0.7 },
  { x: 88, y: 8, size: 1.5, o: 0.5 },
  { x: 94, y: 70, size: 2, o: 0.6 },
  { x: 4, y: 82, size: 1.5, o: 0.4 },
  { x: 48, y: 96, size: 1.5, o: 0.5 },
  { x: 70, y: 2, size: 1, o: 0.6 }
]

useHead({
  title: () => (isNotFound.value ? 'Page not found' : 'Error'),
  meta: [{ name: 'robots', content: 'noindex' }]
})
</script>

<style scoped>
/* A satellite: a tiny light crossing the scene once, slowly, blinking faintly. */
.satellite {
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 4px;
  border-radius: 9999px;
  background: var(--color-white);
  box-shadow: 0 0 8px 2px color-mix(in oklab, var(--color-indigo-200) 70%, transparent);
  opacity: 0;
  animation:
    satellite-orbit 16s linear 1.5s forwards,
    satellite-blink 1.4s steps(1) 1.5s 11;
}

/* Percentages of the scene, so the path scales with it (a tiny element: moving it is cheap). */
@keyframes satellite-orbit {
  0% {
    left: -4%;
    top: 34%;
    opacity: 0;
  }
  8%,
  92% {
    opacity: 0.9;
  }
  100% {
    left: 104%;
    top: 58%;
    opacity: 0;
  }
}

@keyframes satellite-blink {
  50% {
    background: var(--color-purple-300);
  }
}

@media (prefers-reduced-motion: reduce) {
  .satellite {
    display: none;
  }
}
</style>
