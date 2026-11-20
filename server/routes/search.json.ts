import { queryCollectionSearchSections } from '@nuxt/content/server'

/**
 * Search index for the docs: one entry per page section (heading), with its text content.
 * Prerendered to /search.json and loaded by the client-side search (FlexSearch).
 */
export default defineEventHandler(async (event) => {
  const sections = await queryCollectionSearchSections(event, 'docs', { ignoredTags: ['pre', 'code'] })

  return sections.map(section => ({
    id: section.id,
    title: section.title,
    titles: section.titles,
    content: section.content.slice(0, 2000)
  }))
})
