<template>
  <div>
    <button
      type="button"
      :class="compact
        ? 'flex h-10 w-10 items-center justify-center rounded-lg text-gray-300 transition-colors hover:bg-gray-900 hover:text-white'
        : 'flex items-center gap-2 rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-2 text-sm text-gray-400 transition-colors hover:border-gray-700 hover:bg-gray-900'"
      aria-label="Search documentation"
      @click="open"
    >
      <Icon
        name="ph:magnifying-glass"
        :class="compact ? 'h-5 w-5' : 'h-4 w-4'"
      />
      <template v-if="!compact">
        <span>Search docs...</span>
        <kbd class="ml-auto hidden rounded-sm border border-gray-700 bg-gray-800 px-2 py-0.5 text-xs text-gray-500 sm:inline-block">
          {{ shortcutLabel }}
        </kbd>
      </template>
    </button>

    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="isOpen"
          class="fixed inset-0 z-[60] flex items-start justify-center bg-black/80 p-4 pt-[10vh]"
          role="dialog"
          aria-modal="true"
          aria-label="Search documentation"
          @click.self="close"
        >
          <div class="w-full max-w-2xl rounded-lg border border-gray-800 bg-gray-950 shadow-2xl">
            <div class="flex items-center gap-3 border-b border-gray-800 p-4">
              <Icon
                name="ph:magnifying-glass"
                class="h-5 w-5 text-gray-400"
              />
              <input
                ref="searchInput"
                v-model="query"
                type="search"
                placeholder="Search documentation..."
                aria-label="Search documentation"
                class="flex-1 bg-transparent text-white outline-hidden placeholder:text-gray-500 [&::-webkit-search-cancel-button]:appearance-none"
                @keydown.enter="openFirstResult"
              >
              <button
                type="button"
                class="text-gray-500 hover:text-gray-300"
                aria-label="Close search"
                @click="close"
              >
                <Icon
                  name="ph:x"
                  class="h-5 w-5"
                />
              </button>
            </div>

            <div class="max-h-[60vh] overflow-y-auto p-2">
              <p
                v-if="error"
                class="p-8 text-center text-red-400"
              >
                {{ error }}
              </p>
              <p
                v-else-if="isIndexing"
                class="p-8 text-center text-gray-500"
              >
                Loading search index...
              </p>
              <p
                v-else-if="!query.trim()"
                class="p-8 text-center text-gray-500"
              >
                Type to search the documentation
              </p>
              <p
                v-else-if="!results.length"
                class="p-8 text-center text-gray-500"
              >
                No results for "{{ query }}"
              </p>
              <ul
                v-else
                class="space-y-1"
              >
                <li
                  v-for="result in results"
                  :key="result.path"
                >
                  <NuxtLink
                    :to="result.path"
                    class="block rounded-lg p-3 transition-colors hover:bg-gray-900 focus:bg-gray-900 focus:outline-hidden"
                    @click="close"
                  >
                    <span class="text-xs tracking-wide text-blue-400 uppercase">
                      {{ result.category }}<template v-if="result.pageTitle && result.pageTitle !== result.title"> · {{ result.pageTitle }}</template>
                    </span>
                    <span class="mt-1 block font-medium text-white">{{ result.title }}</span>
                    <span
                      v-if="result.excerpt"
                      class="mt-1 line-clamp-2 block text-sm text-gray-400"
                    >{{ result.excerpt }}</span>
                  </NuxtLink>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { SearchResult } from '~/composables/useDocSearch'

const props = withDefaults(defineProps<{ compact?: boolean }>(), { compact: false })

const { initializeSearch, search, isIndexing, error } = useDocSearch()
const route = useRoute()

const query = ref('')
const results = ref<SearchResult[]>([])
const isOpen = ref(false)
const searchInput = ref<HTMLInputElement>()
const shortcutLabel = ref('Ctrl K')

const open = () => {
  isOpen.value = true
  initializeSearch()
  nextTick(() => searchInput.value?.focus())
}

const close = () => {
  isOpen.value = false
  query.value = ''
  results.value = []
}

const openFirstResult = () => {
  const first = results.value[0]
  if (first) {
    navigateTo(first.path)
    close()
  }
}

let searchTimeout: ReturnType<typeof setTimeout> | undefined
const runSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    results.value = search(query.value)
  }, 150)
}

watch(query, runSearch)
// Results typed before the index finished loading.
watch(isIndexing, (indexing) => {
  if (!indexing) runSearch()
})
watch(() => route.fullPath, close)

const onKeydown = (event: KeyboardEvent) => {
  // The header also renders a compact instance for mobile; only the full one owns the shortcut.
  if (!props.compact && (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    if (isOpen.value) close()
    else open()
  } else if (event.key === 'Escape' && isOpen.value) {
    close()
  }
}

onMounted(() => {
  if (/Mac|iPhone|iPad/.test(navigator.platform)) shortcutLabel.value = '⌘K'
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  clearTimeout(searchTimeout)
  window.removeEventListener('keydown', onKeydown)
})
</script>
