<template>
  <section
    id="community"
    class="py-16 px-4"
  >
    <div class="container mx-auto">
      <h2 class="text-3xl font-bold text-center mb-12">
        Join the Community
      </h2>
      <div class="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
        <div class="bg-gray-800/30 p-6 rounded-lg border border-gray-700">
          <h3 class="text-xl font-semibold mb-4">
            Get Involved
          </h3>
          <p class="text-gray-300 mb-6">
            There are many ways to contribute to Lunar Linux, whether you're a developer, writer, or just an enthusiastic user.
          </p>
          <ul class="space-y-3">
            <IconLink
              v-for="link in involvedLinks"
              :key="link.text"
              :icon="link.icon"
              :text="link.text"
              :href="link.href"
            />
          </ul>
        </div>
        <div class="bg-gray-800/30 p-6 rounded-lg border border-gray-700">
          <h3 class="text-xl font-semibold mb-4">
            Connect With Us
          </h3>
          <p class="text-gray-300 mb-6">
            Join discussions, get help, and share your Lunar Linux experience.
          </p>
          <ul class="space-y-3">
            <IconLink
              v-for="link in connectLinks"
              :key="link.text"
              :icon="link.icon"
              :text="link.text"
              :href="link.href"
            />
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
type CommunityItem = {
  text: string
  href: string
  icon: string
}

// TODO: replace the remaining '#' placeholders once the real destinations are confirmed.
const involvedLinks: CommunityItem[] = [
  {
    text: 'Contribute to the codebase',
    href: 'https://github.com/lunar-linux',
    icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4'
  },
  {
    text: 'Write documentation',
    href: '/docs/contributing',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
  },
  {
    text: 'Help others in forums',
    href: '#',
    icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z'
  }
]

const connectLinks: CommunityItem[] = [
  {
    text: 'Forums',
    href: '#',
    icon: 'M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z'
  },
  {
    text: 'IRC: #lunar on Libera.Chat',
    href: 'https://web.libera.chat/#lunar',
    icon: 'M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z'
  },
  {
    text: 'Social Media',
    href: '#',
    icon: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z'
  }
]
</script>
