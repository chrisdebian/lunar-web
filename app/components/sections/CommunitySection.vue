<template>
  <section
    id="community"
    class="px-6 py-24"
    aria-labelledby="community-title"
  >
    <div class="container mx-auto grid max-w-6xl gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
      <div>
        <h2
          id="community-title"
          class="text-3xl font-bold tracking-[-0.03em] text-white sm:text-4xl"
        >
          Talk to us on IRC
        </h2>
        <p class="mt-4 max-w-lg text-gray-300">
          Users and developers meet in <span class="font-medium text-white">#lunar</span> on Libera.Chat.
          Ask questions, share what you've built, or help someone else get started.
        </p>

        <div class="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
          <a
            href="https://web.libera.chat/#lunar"
            class="rounded-lg bg-indigo-600 px-5 py-2.5 font-medium text-white shadow-lg shadow-indigo-950/50 transition-colors hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300"
          >
            Open web chat
          </a>
          <p class="font-mono text-sm text-gray-400">
            irc.libera.chat <span class="text-gray-200">#lunar</span>
          </p>
        </div>
      </div>

      <div>
        <h3 class="font-semibold text-white">
          Ways to help
        </h3>
        <ul class="mt-4 border-t border-white/10">
          <li
            v-for="link in helpLinks"
            :key="link.text"
            class="border-b border-white/10"
          >
            <NuxtLink
              v-if="link.href.startsWith('/')"
              :to="link.href"
              class="help-link"
            >
              {{ link.text }}
            </NuxtLink>
            <a
              v-else
              :href="link.href"
              class="help-link"
            >{{ link.text }}</a>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
type HelpLink = { text: string, href: string }

// TODO: replace the '#' placeholders once the real destinations are confirmed.
const helpLinks: HelpLink[] = [
  { text: 'Contribute code on GitHub', href: 'https://github.com/lunar-linux' },
  { text: 'Improve the documentation', href: '/docs/contributing' },
  { text: 'Help others in the forums', href: '#' },
  { text: 'Follow Lunar on social media', href: '#' }
]
</script>

<style scoped>
.help-link {
  display: block;
  padding-block: 0.875rem;
  color: var(--color-gray-300);
  transition: color 0.2s;
}

.help-link:hover {
  color: var(--color-white);
}
</style>
