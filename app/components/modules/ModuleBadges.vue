<template>
  <span
    v-if="module.crater || module.beta"
    class="inline-flex gap-1.5 align-[0.1em]"
  >
    <span
      v-if="module.crater"
      class="rounded-full border border-white/15 px-2 py-px text-[0.7rem] font-medium text-gray-300"
      title="Upstream stopped developing this; it's still in the moonbase and still builds"
    >Crater</span>
    <span
      v-if="module.beta"
      class="rounded-full border border-amber-300/30 px-2 py-px text-[0.7rem] font-medium text-amber-200"
      title="A beta module, in zbeta"
    >Beta</span>
  </span>
</template>

<script setup lang="ts">
defineProps<{ module: { crater?: boolean, beta?: boolean } }>()
</script>
