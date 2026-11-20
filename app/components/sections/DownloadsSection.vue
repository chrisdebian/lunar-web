<template>
  <section
    id="downloads"
    class="py-16 px-4"
  >
    <div class="container mx-auto">
      <h2 class="text-3xl font-bold text-center mb-12">
        Get Lunar Linux
      </h2>
      <div class="max-w-4xl mx-auto bg-gray-800/30 rounded-lg p-8 border border-gray-700">
        <div class="grid md:grid-cols-2 gap-8">
          <div>
            <h3 class="text-xl font-semibold mb-4">
              Latest Stable Release
            </h3>
            <p class="mb-6 text-gray-300">
              Installation ISO images and verification
            </p>
            <ul class="space-y-3">
              <IconLink
                v-for="link in stableLinks"
                :key="link.text"
                :icon="link.icon"
                :text="link.text"
                :href="link.href"
              />
            </ul>
          </div>
          <div>
            <h3 class="text-xl font-semibold mb-4">
              Development Version
            </h3>
            <p class="mb-6 text-gray-300">
              For testing and contributing
            </p>
            <ul class="space-y-3">
              <IconLink
                v-for="link in devLinks"
                :key="link.text"
                :icon="link.icon"
                :text="link.text"
                :href="link.href"
              />
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
type DownloadItem = {
  text: string
  href: string
  icon: string
}

// TODO: replace the '#' placeholders once the real download locations are confirmed.
const stableLinks: DownloadItem[] = [
  {
    text: 'Installation ISO (x86_64)',
    href: '#',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
  },
  {
    text: 'Checksum & Verification',
    href: '#',
    icon: 'M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2'
  }
]

const devLinks: DownloadItem[] = [
  {
    text: 'Source Code (GitHub)',
    href: 'https://github.com/lunar-linux',
    icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4'
  },
  {
    text: 'Nightly Builds',
    href: '#',
    icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
  },
  {
    text: 'Bug Reporting',
    href: '#',
    icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z'
  }
]
</script>
