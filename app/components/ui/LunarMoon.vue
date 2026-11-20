<!--
  The moon at a given phase (0 = new, 0.25 = first quarter, 0.5 = full, 0.75 = last quarter),
  as seen from the northern hemisphere: waxing moons are lit on the right. Purely decorative.
-->
<template>
  <svg
    viewBox="0 0 1000 1000"
    aria-hidden="true"
    focusable="false"
  >
    <defs>
      <radialGradient
        :id="id('halo')"
        cx="0.5"
        cy="0.5"
        r="0.5"
      >
        <stop
          offset="0.72"
          stop-color="#818CF8"
          :stop-opacity="0.04 + 0.16 * illumination"
        />
        <stop
          offset="0.86"
          stop-color="#818CF8"
          :stop-opacity="0.015 + 0.05 * illumination"
        />
        <stop
          offset="1"
          stop-color="#818CF8"
          stop-opacity="0"
        />
      </radialGradient>

      <!-- Light comes from the lit side, so the brightest point follows the phase. -->
      <radialGradient
        :id="id('surface')"
        :cx="isWaxing ? 0.64 : 0.36"
        cy="0.38"
        r="0.75"
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

      <!-- The terminator (day/night line) is soft; the limb stays sharp via the disc clip below. -->
      <filter
        :id="id('terminator')"
        x="-10%"
        y="-10%"
        width="120%"
        height="120%"
      >
        <feGaussianBlur stdDeviation="9" />
      </filter>

      <filter
        :id="id('glow')"
        x="-20%"
        y="-20%"
        width="140%"
        height="140%"
      >
        <feGaussianBlur stdDeviation="10" />
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

      <mask :id="id('phase')">
        <rect
          width="1000"
          height="1000"
          fill="black"
        />
        <path
          v-if="litPath"
          :d="litPath"
          fill="white"
          :filter="`url(#${id('terminator')})`"
        />
      </mask>

      <clipPath :id="id('disc')">
        <circle
          :cx="C"
          :cy="C"
          :r="R"
        />
      </clipPath>
    </defs>

    <circle
      :cx="C"
      :cy="C"
      r="500"
      :fill="`url(#${id('halo')})`"
    />

    <!-- The moon is in front of the stars: an opaque night-sky disc hides them, even at new moon -->
    <circle
      :cx="C"
      :cy="C"
      :r="R"
      fill="#070B1A"
    />

    <!-- Earthshine: the unlit disc, just visible (the only thing left at new moon) -->
    <circle
      :cx="C"
      :cy="C"
      :r="R"
      fill="#312E81"
      fill-opacity="0.16"
    />

    <g :clip-path="`url(#${id('disc')})`">
      <g :mask="`url(#${id('phase')})`">
        <circle
          :cx="C"
          :cy="C"
          :r="R"
          :fill="`url(#${id('surface')})`"
        />
        <rect
          width="1000"
          height="1000"
          :filter="`url(#${id('grain')})`"
          opacity="0.6"
        />
        <!-- Maria: the dark basaltic plains, roughly where they are on the real near side -->
        <g
          fill="#4F46E5"
          fill-opacity="0.2"
          :filter="`url(#${id('soft')})`"
        >
          <ellipse
            v-for="mare in maria"
            :key="`${mare.x}-${mare.y}`"
            :cx="mare.x"
            :cy="mare.y"
            :rx="mare.rx"
            :ry="mare.ry"
          />
        </g>
        <circle
          v-for="crater in craters"
          :key="`${crater.x}-${crater.y}`"
          :cx="crater.x"
          :cy="crater.y"
          :r="crater.r"
          :fill="`url(#${id('crater')})`"
        />
        <!-- Optional one-off highlight running along the lit limb, top to bottom -->
        <circle
          v-if="glint"
          class="moon-glint"
          :cx="C"
          :cy="C"
          :r="R - 6"
          fill="none"
          stroke="#F5F7FF"
          stroke-width="28"
          stroke-linecap="round"
          :filter="`url(#${id('glow')})`"
        />
      </g>
    </g>
  </svg>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  /** Position in the lunar cycle, 0–1 (0 = new moon, 0.5 = full moon). */
  phase: number
  /** Play a one-off highlight along the lit edge when mounted. */
  glint?: boolean
}>(), { glint: false })

const C = 500 // centre
const R = 400 // radius

// Unique ids per instance so several moons on one page don't share <defs>.
const uid = useId()
const id = (name: string) => `moon-${uid}-${name}`

const normalizedPhase = computed(() => ((props.phase % 1) + 1) % 1)
const isWaxing = computed(() => normalizedPhase.value < 0.5)
/** Fraction of the disc that is lit, 0–1. */
const illumination = computed(() => (1 - Math.cos(2 * Math.PI * normalizedPhase.value)) / 2)

/**
 * The lit area: the half disc on the lit side plus (gibbous) or minus (crescent) half an ellipse
 * whose horizontal radius is R·|cos(2π·phase)|. The limb side is drawn OVERSHOOT larger than the
 * disc so the terminator blur doesn't soften the edge; the disc clip-path trims it back to a sharp limb.
 */
const OVERSHOOT = 40
const litPath = computed(() => {
  if (illumination.value < 0.002) return '' // new moon: nothing lit
  const cos = Math.cos(2 * Math.PI * normalizedPhase.value)
  const rx = (Math.abs(cos) * R).toFixed(2)
  const isCrescent = cos > 0
  const limbSweep = isWaxing.value ? 1 : 0
  const terminatorSweep = isWaxing.value === isCrescent ? 0 : 1
  const outer = R + OVERSHOOT
  return [
    `M ${C} ${C - outer}`,
    `A ${outer} ${outer} 0 0 ${limbSweep} ${C} ${C + outer}`, // limb, outside the disc
    `L ${C} ${C + R}`,
    `A ${rx} ${R} 0 0 ${terminatorSweep} ${C} ${C - R}`, // terminator
    'Z'
  ].join(' ')
})

const maria = [
  { x: 390, y: 330, rx: 110, ry: 85 }, // Imbrium
  { x: 560, y: 360, rx: 70, ry: 60 }, // Serenitatis
  { x: 610, y: 470, rx: 85, ry: 65 }, // Tranquillitatis
  { x: 760, y: 410, rx: 45, ry: 38 }, // Crisium
  { x: 300, y: 500, rx: 95, ry: 140 }, // Oceanus Procellarum
  { x: 470, y: 600, rx: 70, ry: 50 } // Nubium
]

const craters = [
  { x: 470, y: 790, r: 30 }, // Tycho
  { x: 410, y: 430, r: 18 }, // Copernicus
  { x: 260, y: 360, r: 14 },
  { x: 650, y: 650, r: 22 },
  { x: 720, y: 560, r: 12 },
  { x: 560, y: 720, r: 14 },
  { x: 330, y: 680, r: 16 },
  { x: 600, y: 240, r: 11 }
]
</script>

<style scoped>
/*
 * The glint is a short dash on a circle. SVG circles start at 3 o'clock and run clockwise
 * (circumference 2π·394 ≈ 2476): 12 o'clock is at ~1857, 6 o'clock at ~619. Moving the dash
 * backwards along the path sweeps it over the left (lit) limb from top to bottom.
 */
.moon-glint {
  stroke-dasharray: 360 2116;
  stroke-dashoffset: -1857;
  opacity: 0;
  animation: moon-glint 1.1s cubic-bezier(0.45, 0, 0.2, 1) 0.9s forwards;
}

@keyframes moon-glint {
  0% {
    stroke-dashoffset: -1857;
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  75% {
    opacity: 1;
  }
  100% {
    stroke-dashoffset: -259;
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .moon-glint {
    display: none;
  }
}
</style>
