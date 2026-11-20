<template>
  <section
    id="features"
    class="px-6 py-24"
    aria-labelledby="features-title"
  >
    <div class="container mx-auto grid max-w-6xl gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
      <div>
        <h2
          id="features-title"
          class="text-3xl font-bold tracking-[-0.03em] text-white sm:text-4xl"
        >
          Why Lunar Linux
        </h2>
        <p class="mt-4 max-w-md text-gray-400">
          A source-based system without the busywork. Pick a feature to see the command behind it.
        </p>

        <div
          class="mt-10 flex flex-col gap-1"
          role="tablist"
          aria-label="Features"
          aria-orientation="vertical"
          @keydown="onKeydown"
        >
          <button
            v-for="(feature, index) in features"
            :id="`feature-tab-${index}`"
            :key="feature.title"
            ref="tabs"
            type="button"
            role="tab"
            :aria-selected="active === index"
            :aria-controls="`feature-panel`"
            :tabindex="active === index ? 0 : -1"
            class="feature-tab group relative rounded-lg py-4 pr-4 pl-6 text-left transition-colors focus-visible:outline-2 focus-visible:outline-indigo-300"
            :class="active === index ? 'bg-white/[0.04]' : 'hover:bg-white/[0.02]'"
            @click="active = index"
          >
            <span
              class="absolute inset-y-3 left-0 w-0.5 rounded-full transition-opacity"
              :class="active === index ? 'bg-linear-to-b from-blue-400 to-purple-400 opacity-100' : 'bg-gray-700 opacity-60'"
              aria-hidden="true"
            />
            <span
              class="block text-lg font-semibold transition-colors"
              :class="active === index ? 'text-white' : 'text-gray-300 group-hover:text-white'"
            >{{ feature.title }}</span>
            <span class="mt-1 block text-sm text-gray-400">{{ feature.summary }}</span>
          </button>
        </div>
      </div>

      <div
        id="feature-panel"
        role="tabpanel"
        :aria-labelledby="`feature-tab-${active}`"
        class="self-center"
      >
        <div class="overflow-hidden rounded-xl border border-white/10 bg-gray-950/80 shadow-2xl shadow-indigo-950/40">
          <div class="flex items-center gap-2 border-b border-white/10 px-4 py-3">
            <span class="h-3 w-3 rounded-full bg-white/10" />
            <span class="h-3 w-3 rounded-full bg-white/10" />
            <span class="h-3 w-3 rounded-full bg-white/10" />
          </div>
          <Transition
            mode="out-in"
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 translate-y-1"
            leave-active-class="transition duration-100 ease-in"
            leave-to-class="opacity-0"
          >
            <div
              :key="active"
              class="px-6 py-8 font-mono text-sm leading-7 sm:text-base"
            >
              <p class="text-gray-500">
                # {{ current.comment }}
              </p>
              <p class="text-gray-100">
                <span
                  class="text-purple-300 select-none"
                  aria-hidden="true"
                >$ </span>{{ current.command }}
              </p>
            </div>
          </Transition>
        </div>
        <p class="mt-6 max-w-xl text-gray-300">
          {{ current.detail }}
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
type Feature = {
  title: string
  summary: string
  comment: string
  command: string
  detail: string
}

// Commands checked against lin/lunar in the Lunar source (prog/lin, prog/lunar).
const features: Feature[] = [
  {
    title: 'Compiled for your machine',
    summary: 'Every package is built on your hardware, with your compiler flags.',
    comment: 'choose compiler optimizations once, in a menu',
    command: 'lunar optimize',
    detail: 'Set your optimizations once and every package you install afterwards is compiled with them, so the whole system is tuned for your CPU.'
  },
  {
    title: 'You choose the options',
    summary: 'Turn optional features and dependencies on or off, per package.',
    comment: 'rebuild a package and pick its optional dependencies again',
    command: 'lin -r firefox',
    detail: 'Lunar asks about optional features when it builds a package. Changed your mind later? Reconfigure and rebuild it with one command.'
  },
  {
    title: 'One command installs anything',
    summary: 'lin fetches the source, resolves dependencies, builds and installs.',
    comment: 'install several packages in one go',
    command: 'lin nano hdparm sudo',
    detail: 'No hand-run configure and make: lin downloads the sources, works out the dependencies, compiles and installs, and tracks everything for clean removal with lrm.'
  },
  {
    title: 'Current and lean',
    summary: 'Only what you install, rebuilt when updates land.',
    comment: 'fetch the latest moonbase and rebuild what changed',
    command: 'lunar update',
    detail: 'Your system contains only the packages you chose. Updating pulls the latest package definitions and recompiles whatever has a newer version.'
  }
]

const active = ref(0)
const current = computed(() => features[active.value]!)
const tabs = ref<HTMLButtonElement[]>([])

// Arrow keys move between tabs (WAI-ARIA tabs pattern).
const onKeydown = (event: KeyboardEvent) => {
  const keys: Record<string, number> = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }
  let next: number | undefined
  if (event.key in keys) next = (active.value + keys[event.key]! + features.length) % features.length
  else if (event.key === 'Home') next = 0
  else if (event.key === 'End') next = features.length - 1
  if (next === undefined) return
  event.preventDefault()
  active.value = next
  tabs.value[next]?.focus()
}
</script>
