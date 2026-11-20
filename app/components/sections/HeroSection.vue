<template>
  <section class="min-h-screen flex items-center justify-center px-4 py-12">
    <div class="container mx-auto max-w-7xl">
      <!-- Hero Content -->
      <div class="text-center mb-16">
        <h1 class="text-5xl font-bold mb-6">
          A Source-Based Linux Distribution
        </h1>
        <p class="text-xl text-gray-300 max-w-3xl mx-auto mb-10">
          Lunar Linux combines the flexibility of source-based distributions with user-friendly tools and interfaces.
          Build your system exactly how you want it, with the support you need.
        </p>
        <div class="flex justify-center space-x-4">
          <NuxtLink
            to="/#downloads"
            class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition-colors"
          >
            Download Lunar
          </NuxtLink>
          <NuxtLink
            to="/docs"
            class="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-colors border border-gray-700"
          >
            Read the Docs
          </NuxtLink>
        </div>
      </div>

      <!-- Why Choose Section -->
      <div id="features">
        <h2 class="text-3xl font-bold text-center mb-10">
          Why Choose Lunar Linux?
        </h2>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            v-for="feature in features"
            :key="feature.title"
            :title="feature.title"
            :description="feature.description"
            :icon="feature.icon"
            :icon-bg="feature.iconBg"
            :icon-color="feature.iconColor"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
type Feature = {
  title: string
  description: string
  icon: string
  iconBg: string
  iconColor: string
}

const features: Feature[] = [
  {
    title: 'Optimized Performance',
    description: 'Compile software specifically for your hardware for maximum speed and efficiency.',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    iconBg: 'bg-blue-500/20',
    iconColor: 'text-blue-400'
  },
  {
    title: 'Complete Control',
    description: 'Choose exactly what features and dependencies to include in every package.',
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    iconBg: 'bg-purple-500/20',
    iconColor: 'text-purple-400'
  },
  {
    title: 'User-Friendly Tools',
    description: 'Intuitive package management and configuration tools that simplify source-based installations.',
    icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4',
    iconBg: 'bg-indigo-500/20',
    iconColor: 'text-indigo-400'
  },
  {
    title: 'Security Focused',
    description: 'Compile with the latest security patches and only install what you need, reducing attack surface.',
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    iconBg: 'bg-blue-500/20',
    iconColor: 'text-blue-400'
  },
  {
    title: 'Supportive Community',
    description: 'Active forums and documentation to help you through any challenges.',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
    iconBg: 'bg-purple-500/20',
    iconColor: 'text-purple-400'
  },
  {
    title: 'Customizability',
    description: 'Build a minimal system or a full desktop experience - it\'s entirely up to you.',
    icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
    iconBg: 'bg-indigo-500/20',
    iconColor: 'text-indigo-400'
  }
]
</script>
