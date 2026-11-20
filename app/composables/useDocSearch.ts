import { Document } from 'flexsearch'

type SearchSection = {
  /** Page path, plus `#heading-id` for sections below the first heading. */
  id: string
  title: string
  /** Parent headings, starting with the page title. */
  titles: string[]
  content: string
}

export type SearchResult = {
  path: string
  title: string
  pageTitle: string
  category: string
  excerpt: string
}

const toResult = (section: SearchSection): SearchResult => {
  const pathname = section.id.split('#')[0] ?? section.id
  const category = pathname.split('/').filter(Boolean)[1] ?? 'docs'
  return {
    path: section.id,
    title: section.title,
    pageTitle: section.titles[0] ?? '',
    category: category.replace(/-/g, ' '),
    excerpt: section.content.slice(0, 160)
  }
}

/** Client-side full-text search over the prerendered docs index (`/search.json`). */
export const useDocSearch = () => {
  const { withBase } = useSiteLinks()

  const isIndexing = ref(false)
  const error = ref<string | null>(null)
  let index: Document | null = null
  const sections = new Map<string, SearchSection>()

  const initializeSearch = async () => {
    if (index || isIndexing.value) return
    isIndexing.value = true
    error.value = null

    try {
      const data = await $fetch<SearchSection[]>(withBase('/search.json'), { responseType: 'json' })
      const next = new Document({
        document: { id: 'id', index: ['title', 'content'] },
        tokenize: 'forward'
      })
      for (const section of data) {
        sections.set(section.id, section)
        next.add(section)
      }
      index = next
    } catch (err) {
      console.error('Failed to load the search index:', err)
      error.value = 'Search is unavailable right now.'
    } finally {
      isIndexing.value = false
    }
  }

  const search = (query: string, limit = 10): SearchResult[] => {
    if (!index || !query.trim()) return []

    // Title matches first, then content matches; de-duplicated.
    const ids = new Set<string>()
    for (const field of index.search(query, { limit })) {
      for (const id of field.result) ids.add(String(id))
    }

    return [...ids]
      .slice(0, limit)
      .map(id => sections.get(id))
      .filter((section): section is SearchSection => Boolean(section))
      .map(toResult)
  }

  return { initializeSearch, search, isIndexing, error }
}
