<template>
  <section
    id="docs"
    class="bg-gray-900/50 px-4 py-16"
  >
    <div class="container mx-auto">
      <h2 class="mb-12 text-center text-3xl font-bold">
        Documentation
      </h2>
      <div class="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
        <DocCard
          v-for="doc in docs"
          :key="doc.title"
          :title="doc.title"
          :description="doc.description"
          :to="doc.to"
        />
      </div>
      <div class="mt-10 text-center">
        <NuxtLink
          to="/docs"
          class="inline-block rounded-lg bg-indigo-600 px-6 py-3 font-medium transition-colors hover:bg-indigo-700"
        >
          View full documentation
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
type DocItem = {
  title: string
  description: string
  to: string
}

const docs: DocItem[] = [
  {
    title: 'Getting Started',
    description: 'Everything you need to know for a fresh installation of Lunar Linux.',
    to: '/docs/installation'
  },
  {
    title: 'Package Management',
    description: 'Learn how to install, update, and manage packages in Lunar Linux.',
    to: '/docs/package-management'
  },
  {
    title: 'System Configuration',
    description: 'Detailed guides on configuring your system for optimal performance.',
    to: '/docs/system-administration'
  }
]
</script>
