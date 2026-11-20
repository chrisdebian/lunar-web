<template>
  <section
    class="hero relative isolate flex min-h-[calc(100svh-6rem)] items-center overflow-hidden"
    aria-labelledby="hero-title"
  >
    <!-- Sky layer: stars and moon, faded out towards the bottom ("horizon") into the page background -->
    <div
      class="hero-sky pointer-events-none absolute inset-0 -z-10"
      aria-hidden="true"
    >
      <!-- Fixed star positions so the server and client render the same thing -->
      <svg
        class="hero-stars absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1600 900"
      >
        <circle
          v-for="(star, index) in stars"
          :key="index"
          :cx="star.x"
          :cy="star.y"
          :r="star.r"
          :fill-opacity="star.o"
          fill="#E0E7FF"
        />
      </svg>

      <!-- The moon: low on the right, cropped by the viewport edge -->
      <div class="hero-moon absolute">
        <div class="hero-moon-set">
          <div class="hero-moon-rise">
            <LunarMoon
              :key="intro"
              :intro="intro"
              class="h-full w-full"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="hero-copy container mx-auto px-6 py-16">
      <div class="max-w-xl">
        <h1
          id="hero-title"
          class="text-4xl leading-[1.1] font-bold tracking-[-0.035em] text-balance text-white sm:text-5xl lg:text-6xl"
        >
          Build your Linux from source.
        </h1>
        <p class="mt-6 max-w-md text-lg leading-relaxed text-gray-300">
          Lunar compiles every package on your machine, with the options you pick.
          One command, <code class="rounded bg-white/10 px-1.5 py-0.5 font-mono text-base text-indigo-200">lin</code>, keeps it simple.
        </p>
        <div class="mt-10 flex flex-wrap gap-4">
          <NuxtLink
            to="/#downloads"
            class="rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white shadow-lg shadow-indigo-950/50 transition-colors hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300"
          >
            Download Lunar
          </NuxtLink>
          <NuxtLink
            to="/docs"
            class="rounded-lg border border-white/15 px-6 py-3 font-medium text-gray-100 transition-colors hover:border-white/30 hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300"
          >
            Read the docs
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// TEMPORARY (intro comparison): /?intro=light (default) | glint | none
type Intro = 'light' | 'glint' | 'none'
const route = useRoute()
const intro = computed<Intro>(() => {
  const value = String(route.query.intro)
  return value === 'glint' || value === 'none' ? value : 'light'
})

type Star = { x: number, y: number, r: number, o: number }

// Small deterministic PRNG (mulberry32) so the starfield is identical on every render.
const seededRandom = (seed: number) => () => {
  seed |= 0
  seed = (seed + 0x6D2B79F5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

const random = seededRandom(1969)
const stars: Star[] = Array.from({ length: 140 }, () => {
  const bright = random() > 0.92
  return {
    x: Math.round(random() * 1600),
    y: Math.round(random() * 760),
    r: bright ? 1.6 : 0.6 + random() * 0.7,
    o: bright ? 0.9 : 0.25 + random() * 0.45
  }
})
</script>

<style scoped>
.hero-sky {
  mask-image: linear-gradient(to bottom, transparent 0, black 12%, black 60%, transparent 100%);
}

.hero-moon {
  /* Large and cropped on desktop; smaller, behind the text, on narrow screens. */
  width: min(115vw, 820px);
  aspect-ratio: 1;
  right: -32%;
  top: -6%;
}

@media (min-width: 768px) {
  .hero-moon {
    width: min(68vw, 860px);
    right: -12%;
    top: 50%;
    translate: 0 -46%;
  }
}

@media (max-width: 767px) {
  .hero-moon {
    opacity: 0.55;
  }
}

/* One orchestrated moment: the moon rises once when the page loads. */
.hero-moon-set,
.hero-moon-rise {
  width: 100%;
  height: 100%;
}

.hero-moon-rise {
  animation: moonrise 1.6s cubic-bezier(0.2, 0.7, 0.2, 1) both;
}

@keyframes moonrise {
  from {
    opacity: 0;
    transform: translateY(10%);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

/* Scrolling away: the moon sets, the stars fade, the copy drifts up. */
@supports (animation-timeline: view()) {
  .hero {
    view-timeline-name: --hero;
  }

  .hero-moon-set,
  .hero-stars,
  .hero-copy {
    animation-duration: auto;
    animation-fill-mode: both;
    animation-timing-function: linear;
    animation-timeline: --hero;
    animation-range: exit 0% exit 100%;
  }

  .hero-moon-set {
    animation-name: moonset;
  }

  .hero-stars {
    animation-name: stars-fade;
  }

  .hero-copy {
    animation-name: copy-drift;
  }
}

@keyframes moonset {
  to {
    transform: translateY(45%);
    opacity: 0.15;
  }
}

@keyframes stars-fade {
  to {
    transform: translateY(12%);
    opacity: 0;
  }
}

@keyframes copy-drift {
  to {
    transform: translateY(-18%);
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-moon-set,
  .hero-moon-rise,
  .hero-stars,
  .hero-copy {
    animation: none !important;
  }
}
</style>
