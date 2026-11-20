import { joinURL } from 'ufo'

export default defineEventHandler((event) => {
  const { siteUrl, indexable } = useRuntimeConfig(event).public

  setResponseHeader(event, 'content-type', 'text/plain; charset=utf-8')
  if (!indexable) return 'User-agent: *\nDisallow: /\n'
  return `User-agent: *
Allow: /

Sitemap: ${joinURL(siteUrl, 'sitemap.xml')}
`
})
