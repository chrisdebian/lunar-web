<!-- A waxing crescent: lit from the left, with earthshine on the dark side. Purely decorative. -->
<template>
  <svg
    viewBox="0 0 1000 1000"
    aria-hidden="true"
    focusable="false"
  >
    <defs>
      <radialGradient
        :id="id('halo')"
        cx="0.4"
        cy="0.48"
        r="0.6"
      >
        <stop
          offset="0.5"
          stop-color="#818CF8"
          stop-opacity="0.16"
        />
        <stop
          offset="0.72"
          stop-color="#818CF8"
          stop-opacity="0.05"
        />
        <stop
          offset="1"
          stop-color="#818CF8"
          stop-opacity="0"
        />
      </radialGradient>

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

      <!-- Lit area: the disc minus an offset, soft-edged shadow disc -->
      <mask :id="id('phase')">
        <rect
          width="1000"
          height="1000"
          fill="black"
        />
        <circle
          cx="500"
          cy="500"
          r="400"
          fill="white"
        />
        <circle
          cx="745"
          cy="470"
          r="430"
          fill="black"
          :filter="`url(#${id('soft')})`"
        />
      </mask>

      <clipPath :id="id('disc')">
        <circle
          cx="500"
          cy="500"
          r="400"
        />
      </clipPath>
    </defs>

    <circle
      cx="500"
      cy="500"
      r="500"
      :fill="`url(#${id('halo')})`"
    />

    <!-- Earthshine: the unlit disc, just visible -->
    <circle
      cx="500"
      cy="500"
      r="400"
      fill="#312E81"
      fill-opacity="0.16"
    />

    <g :mask="`url(#${id('phase')})`">
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
</template>

<script setup lang="ts">
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
