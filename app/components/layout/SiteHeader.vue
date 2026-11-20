<template>
  <header class="fixed inset-x-0 top-0 z-50 w-full border-b border-indigo-500/30 bg-gray-950/95 shadow-lg shadow-indigo-900/20 backdrop-blur-md">
    <div class="container mx-auto flex items-center justify-between gap-4 px-6 py-4">
      <NuxtLink
        to="/"
        aria-label="Lunar Linux home"
      >
        <img
          src="~/assets/lunar_logo-01-full.svg"
          alt="Lunar Linux"
          class="h-12 w-auto"
          width="150"
          height="56"
        >
      </NuxtLink>

      <!-- Desktop navigation -->
      <div class="hidden items-center gap-6 lg:flex">
        <nav aria-label="Main">
          <ul class="flex gap-6">
            <li
              v-for="link in navLinks"
              :key="link.to"
            >
              <NuxtLink
                :to="link.to"
                class="nav-link"
              >
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </nav>
        <DocsSearch />
      </div>

      <!-- Mobile: search + menu toggle -->
      <div class="flex items-center gap-3 lg:hidden">
        <DocsSearch compact />
        <button
          class="flex h-10 w-10 flex-col items-center justify-center"
          :aria-expanded="isMenuOpen"
          aria-controls="mobile-menu"
          aria-label="Toggle navigation menu"
          @click="isMenuOpen = !isMenuOpen"
        >
          <span
            class="mb-1.5 block h-0.5 w-6 bg-blue-300 transition-transform"
            :class="{ 'translate-y-2 rotate-45': isMenuOpen }"
          />
          <span
            class="mb-1.5 block h-0.5 w-6 bg-blue-300 transition-opacity"
            :class="{ 'opacity-0': isMenuOpen }"
          />
          <span
            class="block h-0.5 w-6 bg-blue-300 transition-transform"
            :class="{ '-translate-y-2 -rotate-45': isMenuOpen }"
          />
        </button>
      </div>
    </div>

    <!-- Mobile navigation menu -->
    <nav
      v-if="isMenuOpen"
      id="mobile-menu"
      aria-label="Main"
      class="container mx-auto animate-fade-in px-6 pb-6 lg:hidden"
    >
      <ul class="flex flex-col gap-2">
        <li
          v-for="link in navLinks"
          :key="link.to"
        >
          <NuxtLink
            :to="link.to"
            class="block rounded-lg px-4 py-3 font-medium text-gray-300 transition-all duration-300 hover:translate-x-2 hover:bg-blue-600/20 hover:text-white"
          >
            {{ link.label }}
          </NuxtLink>
        </li>
      </ul>
    </nav>
  </header>
</template>

<script setup lang="ts">
const route = useRoute()
const isMenuOpen = ref(false)

// Close the mobile menu after navigating (including same-page hash links).
watch(() => route.fullPath, () => {
  isMenuOpen.value = false
})

const navLinks = [
  { label: 'Features', to: '/#features' },
  { label: 'News', to: '/news' },
  { label: 'Downloads', to: '/#downloads' },
  { label: 'Documentation', to: '/docs' },
  { label: 'Community', to: '/#community' }
]
</script>

<style scoped>
.nav-link {
  position: relative;
  padding-block: 0.5rem;
  font-weight: 500;
  color: var(--color-gray-300);
  transition: color 0.3s;
}

.nav-link:hover {
  color: var(--color-white);
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--color-blue-400), var(--color-purple-400));
  transition: width 0.3s ease-in-out;
}

.nav-link:hover::after {
  width: 100%;
}
</style>
