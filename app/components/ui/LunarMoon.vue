<!--
  A crescent lit from the left, with earthshine on the dark side. Purely decorative.

  Built as three layers so the load animation stays smooth on phones: only the middle layer
  (an HTML disc) moves, using a GPU-composited transform. Animating anything inside an SVG mask
  with filters forces Safari to re-rasterize the whole SVG every frame.
    1. lit surface, drawn once (SVG)
    2. the shadow: a soft-edged disc clipped to the moon, which slides off on load ("first light")
    3. the halo, on top so the dark side keeps its glow at the rim (SVG)
-->
<template>
  <div
    class="relative aspect-square"
    aria-hidden="true"
  >
    <!-- 1. Night-side base + the full lit surface -->
    <svg
      viewBox="0 0 1000 1000"
      class="absolute inset-0 h-full w-full"
      focusable="false"
    >
      <defs>
        <radialGradient
          :id="id('surface')"
          cx="0.36"
          cy="0.36"
          r="0.72"
        >
          <stop
            offset="0"
            stop-color="#E0E7FF"
          />
          <stop
            offset="0.5"
            stop-color="#B4BEF5"
          />
          <stop
            offset="1"
            stop-color="#5B5FB8"
          />
        </radialGradient>

        <radialGradient
          :id="id('crater')"
          cx="0.42"
          cy="0.4"
          r="0.6"
        >
          <stop
            offset="0"
            stop-color="#3730A3"
            stop-opacity="0.22"
          />
          <stop
            offset="0.75"
            stop-color="#3730A3"
            stop-opacity="0.1"
          />
          <stop
            offset="0.9"
            stop-color="#EEF2FF"
            stop-opacity="0.12"
          />
          <stop
            offset="1"
            stop-color="#EEF2FF"
            stop-opacity="0"
          />
        </radialGradient>

        <filter
          :id="id('soft')"
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
        >
          <feGaussianBlur stdDeviation="14" />
        </filter>

        <filter :id="id('grain')">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.011"
            numOctaves="4"
            seed="11"
          />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.27  0 0 0 0 0.22  0 0 0 0 0.79  0 0 0 0.55 -0.12"
          />
        </filter>

        <clipPath :id="id('disc')">
          <circle
            cx="500"
            cy="500"
            r="400"
          />
        </clipPath>
      </defs>

      <!-- The moon sits in front of the stars: an opaque disc hides them -->
      <circle
        cx="500"
        cy="500"
        r="400"
        :fill="NIGHT_SIDE"
      />
      <!-- Everything lit; dimmable via --moon-light without making the disc see-through -->
      <g class="moon-light">
        <circle
          cx="500"
          cy="500"
          r="400"
          :fill="`url(#${id('surface')})`"
        />
        <g :clip-path="`url(#${id('disc')})`">
          <rect
            width="1000"
            height="1000"
            :filter="`url(#${id('grain')})`"
            opacity="0.6"
          />
          <!-- Maria: the dark basaltic plains -->
          <g
            fill="#4F46E5"
            fill-opacity="0.2"
            :filter="`url(#${id('soft')})`"
          >
            <ellipse
              cx="330"
              cy="360"
              rx="120"
              ry="90"
            />
            <ellipse
              cx="420"
              cy="470"
              rx="90"
              ry="70"
            />
            <ellipse
              cx="290"
              cy="560"
              rx="110"
              ry="80"
            />
            <ellipse
              cx="400"
              cy="660"
              rx="70"
              ry="55"
            />
          </g>
          <!-- Craters -->
          <circle
            v-for="crater in craters"
            :key="`${crater.x}-${crater.y}`"
            :cx="crater.x"
            :cy="crater.y"
            :r="crater.r"
            :fill="`url(#${id('crater')})`"
          />
        </g>
      </g>
    </svg>

    <!--
      2. The shadow, clipped to the disc. The clip is 1.5 units wider than the disc (r=401.5) so the
      lit surface's anti-aliased edge can't peek out as a bright hairline along the dark limb.
    -->
    <div class="absolute inset-[9.85%] overflow-hidden rounded-full">
      <div
        class="moon-shadow absolute"
        :class="{ 'is-playing': play }"
        :style="{ background: SHADOW_GRADIENT }"
      />
    </div>

    <!-- 3. Halo over everything: glow around the moon and at the rim of the dark side -->
    <svg
      viewBox="0 0 1000 1000"
      class="moon-light pointer-events-none absolute inset-0 h-full w-full overflow-visible"
      focusable="false"
    >
      <defs>
        <!-- Moon edge sits at 400/720 ≈ 0.56 of the halo radius; the glow eases out to nothing at 1. -->
        <radialGradient
          :id="id('halo')"
          cx="0.5"
          cy="0.5"
          r="0.5"
        >
          <!-- Faint inside the disc (the unlit side), brightest right at the rim -->
          <stop
            offset="0"
            stop-color="#818CF8"
            stop-opacity="0.05"
          />
          <stop
            offset="0.48"
            stop-color="#818CF8"
            stop-opacity="0.08"
          />
          <stop
            offset="0.56"
            stop-color="#818CF8"
            stop-opacity="0.14"
          />
          <stop
            offset="0.62"
            stop-color="#818CF8"
            stop-opacity="0.1"
          />
          <stop
            offset="0.69"
            stop-color="#818CF8"
            stop-opacity="0.065"
          />
          <stop
            offset="0.77"
            stop-color="#818CF8"
            stop-opacity="0.035"
          />
          <stop
            offset="0.86"
            stop-color="#818CF8"
            stop-opacity="0.014"
          />
          <stop
            offset="0.94"
            stop-color="#818CF8"
            stop-opacity="0.004"
          />
          <stop
            offset="1"
            stop-color="#818CF8"
            stop-opacity="0"
          />
        </radialGradient>
      </defs>
      <circle
        cx="470"
        cy="490"
        r="720"
        :fill="`url(#${id('halo')})`"
      />
    </svg>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  /** Start the "first light" animation (held on its first frame, the unlit moon, until then). */
  play?: boolean
}>(), { play: true })

/** The unlit side: dark sky with a faint earthshine tint. */
const NIGHT_SIDE = '#0C0F25'

/**
 * Soft-edged shadow disc, matching the original SVG shadow (r=430 with a Gaussian blur of 14).
 * The element has radius 470 so the falloff fits; stops are fractions of 470.
 */
const SHADOW_GRADIENT = `radial-gradient(circle closest-side, ${[
  [1, 0.851], // fully dark up to r=400
  [0.84, 0.885],
  [0.5, 0.915], // edge of the r=430 disc
  [0.16, 0.945],
  [0.02, 0.975],
  [0, 1]
].map(([alpha, at]) => `rgb(12 15 37 / ${alpha}) ${(at! * 100).toFixed(1)}%`).join(', ')})`

// Unique ids per instance so several moons on one page don't share <defs>.
const uid = useId()
const id = (name: string) => `moon-${uid}-${name}`

const craters = [
  { x: 250, y: 720, r: 34 },
  { x: 330, y: 790, r: 18 },
  { x: 205, y: 470, r: 22 },
  { x: 470, y: 260, r: 26 },
  { x: 380, y: 230, r: 12 },
  { x: 520, y: 760, r: 14 },
  { x: 175, y: 610, r: 12 },
  { x: 300, y: 300, r: 9 }
]
</script>

<style scoped>
/* Brightness of the lit surface and halo (0–1). The night side and shadow stay opaque. */
.moon-light {
  opacity: var(--moon-light, 1);
}

/*
 * Shadow geometry in moon units (1000 box; the clipping wrapper spans 98.5..901.5, 803 wide):
 * resting centre (745, 470), radius 470 → left 21.980%, top -12.267%, size 117.061% of the wrapper.
 */
.moon-shadow {
  left: 21.980%;
  top: -12.267%;
  width: 117.061%;
  height: 117.061%;
  will-change: transform;
  /*
   * "First light": start centred on the moon (nothing lit), slide to rest. The offset
   * (-245, +30) moon units is expressed as a percentage of the element's own 940-unit size.
   */
  animation: moon-first-light 1.2s cubic-bezier(0.45, 0.05, 0.25, 1) 0.35s both paused;
}

.moon-shadow.is-playing {
  animation-play-state: running;
}

@keyframes moon-first-light {
  from {
    transform: translate(-26.064%, 3.191%);
  }
  to {
    transform: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .moon-shadow {
    animation: none;
  }
}
</style>
