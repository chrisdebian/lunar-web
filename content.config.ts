import { defineCollection, defineContentConfig, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    docs: defineCollection({
      type: 'page',
      source: 'docs/**/*.md',
      schema: z.object({
        category: z.string().optional(),
        tags: z.array(z.string()).default([]),
        lastUpdated: z.date().optional(),
        order: z.number().optional(),
        archived: z.boolean().default(false),
        seeAlso: z.array(z.object({
          title: z.string(),
          path: z.string()
        })).optional()
      })
    }),
    news: defineCollection({
      type: 'page',
      source: 'news/*.md',
      schema: z.object({
        date: z.date()
      })
    })
  }
})
