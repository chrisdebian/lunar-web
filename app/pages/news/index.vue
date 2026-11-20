<template>
  <div class="px-6 pt-12 pb-24">
    <div class="container mx-auto max-w-4xl">
      <header class="max-w-2xl">
        <h1 class="text-4xl font-bold tracking-[-0.035em] text-balance text-white sm:text-5xl">
          News
        </h1>
        <p class="mt-4 text-lg text-gray-400">
          Announcements from the Lunar Linux team, each logged with the moon it was posted under.
        </p>
        <a
          :href="withBase('/rss.xml')"
          class="mt-5 inline-flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-white"
        >
          <Icon
            name="ph:rss-bold"
            class="h-4 w-4"
          />
          Subscribe via RSS
        </a>
      </header>

      <ol
        v-if="entries.length"
        class="news-log mt-16"
        :class="{ 'is-playing': isSettled }"
      >
        <template
          v-for="entry in entries"
          :key="entry.path"
        >
          <!-- Year marker on the orbit. The year is also in every date, so it's hidden from screen readers. -->
          <li
            v-if="entry.startsYear"
            class="news-year relative grid grid-cols-[3rem_minmax(0,1fr)] gap-x-5 pb-6 sm:grid-cols-[3.5rem_minmax(0,1fr)] sm:gap-x-8"
            :style="{ '--i': entry.order }"
            aria-hidden="true"
          >
            <span class="news-orbit"><span class="news-orbit-dots" /></span>
            <span class="news-year-label text-center text-sm font-semibold text-indigo-200/80 tabular-nums">{{ entry.year }}</span>
          </li>

          <li
            class="news-entry group relative grid grid-cols-[3rem_minmax(0,1fr)] gap-x-5 pb-14 last:pb-0 sm:grid-cols-[3.5rem_minmax(0,1fr)] sm:gap-x-8"
            :style="{ '--i': entry.order }"
          >
            <!-- The orbit: a dotted line from this moon down to the next one -->
            <span
              class="news-orbit"
              aria-hidden="true"
            ><span class="news-orbit-dots" /></span>

            <div class="news-moon relative">
              <MoonPhaseIcon
                :phase="entry.phase"
                class="h-full w-full transition-transform duration-300 group-hover:scale-110"
              />
            </div>

            <div class="news-text">
              <p class="flex flex-wrap items-baseline gap-x-3 text-sm">
                <time
                  :datetime="String(entry.date)"
                  class="text-gray-400 tabular-nums"
                >{{ formatDate(entry.date) }}</time>
                <span class="text-indigo-300/70">{{ entry.phaseName }}</span>
              </p>
              <h2 class="mt-2 text-xl font-semibold tracking-tight text-balance wrap-break-word text-white transition-colors group-hover:text-indigo-200 sm:text-2xl">
                <!-- The link covers the whole entry -->
                <NuxtLink
                  :to="entry.path"
                  class="after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:rounded-lg focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-indigo-300"
                >
                  {{ entry.title }}
                </NuxtLink>
              </h2>
              <p class="mt-3 max-w-2xl text-gray-400">
                {{ entry.description }}
              </p>
              <p
                v-if="entry.readingTime"
                class="mt-3 text-sm text-gray-500"
              >
                {{ entry.readingTime }} min read
              </p>
            </div>
          </li>
        </template>
      </ol>

      <p
        v-else
        class="mt-16 text-gray-400"
      >
        No news yet.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const { withBase } = useSiteLinks()

const { data: articles } = await useAsyncData('news-list', () =>
  queryCollection('news').select('title', 'description', 'date', 'path', 'readingTime').order('date', 'DESC').order('path', 'ASC').all(),
{ default: () => [] }
)

const entries = computed(() => articles.value.map((article, index) => {
  const phase = moonPhaseAt(new Date(article.date))
  const year = new Date(article.date).getUTCFullYear()
  const startsYear = index === 0 || new Date(articles.value[index - 1]!.date).getUTCFullYear() !== year
  // Only the first few entries are staggered; the rest arrive together.
  return { ...article, phase, phaseName: moonPhaseName(phase), year, startsYear, order: Math.min(index, 6) }
}))

// The orbit draws itself down the list once the page has settled (see AGENTS.md).
const isSettled = usePageSettled()

useHead({
  noscript: [{ innerHTML: '<style>.news-log *{animation:none!important}</style>' }]
})

usePageSeo({
  title: 'News',
  description: 'Announcements and updates from the Lunar Linux team'
})
</script>

<style scoped>
.news-log {
  --step: 0.4s;
  --moon: 3rem;
}

@media (min-width: 640px) {
  .news-log {
    --moon: 3.5rem;
  }
}

.news-moon {
  width: var(--moon);
  height: var(--moon);
  padding: 0.2rem;
}

.news-orbit {
  position: absolute;
  /* Stops a little short of both moons */
  top: calc(var(--moon) + 0.35rem);
  bottom: 0.35rem;
  left: calc(var(--moon) / 2 - 1.5px);
  width: 3px;
  overflow: hidden;
}

.news-entry:last-child .news-orbit {
  display: none;
}

/* From just below the year down to the next moon */
.news-year .news-orbit {
  top: 1.6rem;
}

.news-orbit-dots {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle, rgb(165 180 252 / 0.45) 1px, transparent 1.5px) center top / 3px 9px repeat-y;
}

/*
 * One orchestrated moment: each moon appears in turn and the orbit draws down to the next one.
 * Only transform and opacity, held paused until the page has settled (see AGENTS.md).
 */
.news-moon {
  animation: news-moon-in 0.5s cubic-bezier(0.2, 0.7, 0.2, 1) both paused;
  animation-delay: calc(var(--i) * var(--step));
}

.news-text,
.news-year-label {
  animation: news-text-in 0.6s ease-out both paused;
  animation-delay: calc(var(--i) * var(--step) + 0.05s);
}

.news-orbit-dots {
  animation: news-orbit-draw calc(var(--step) - 0.1s) linear both paused;
  animation-delay: calc(var(--i) * var(--step) + 0.1s);
}

.is-playing :is(.news-moon, .news-text, .news-year-label, .news-orbit-dots) {
  animation-play-state: running;
}

@keyframes news-moon-in {
  from {
    opacity: 0.001;
    transform: scale(0.6);
  }
}

@keyframes news-text-in {
  from {
    opacity: 0.001;
    transform: translateY(6px);
  }
}

@keyframes news-orbit-draw {
  from {
    transform: translateY(-100%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .news-moon,
  .news-text,
  .news-year-label,
  .news-orbit-dots {
    animation: none;
  }
}
</style>
