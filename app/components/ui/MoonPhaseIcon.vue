<!--
  A small, filter-free moon at a given phase (0 = new, 0.5 = full), northern-hemisphere view:
  waxing moons are lit on the right. Decorative; pair it with a text label.
-->
<template>
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
  >
    <circle
      cx="12"
      cy="12"
      r="10"
      fill="#1E1B4B"
      stroke="#A5B4FC"
      stroke-opacity="0.25"
      stroke-width="0.75"
    />
    <path
      v-if="litPath"
      :d="litPath"
      fill="#C7D2FE"
    />
  </svg>
</template>

<script setup lang="ts">
const props = defineProps<{ phase: number }>()

const C = 12
const R = 10

/**
 * The lit area: the half disc on the lit side plus (gibbous) or minus (crescent) half an ellipse
 * whose horizontal radius is R·|cos(2π·phase)|.
 */
const litPath = computed(() => {
  const phase = ((props.phase % 1) + 1) % 1
  if (moonIllumination(phase) < 0.01) return '' // new moon
  const cos = Math.cos(2 * Math.PI * phase)
  const isWaxing = phase < 0.5
  const isCrescent = cos > 0
  const rx = (Math.abs(cos) * R).toFixed(3)
  const limbSweep = isWaxing ? 1 : 0
  const terminatorSweep = isWaxing === isCrescent ? 0 : 1
  return `M ${C} ${C - R} A ${R} ${R} 0 0 ${limbSweep} ${C} ${C + R} A ${rx} ${R} 0 0 ${terminatorSweep} ${C} ${C - R} Z`
})
</script>
