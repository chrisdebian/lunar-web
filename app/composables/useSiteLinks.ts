import { joinURL } from 'ufo'

/**
 * Builds URLs that respect the configured base URL (sub-directory hosting) and site URL.
 * Use `withBase` for plain `<a href>`/`$fetch` targets that bypass the router, such as
 * prerendered files (`/rss.xml`, `/search.json`). Router links should use `<NuxtLink>`.
 */
export const useSiteLinks = () => {
  const config = useRuntimeConfig()

  const withBase = (path: string) => joinURL(config.app.baseURL, path)
  const absoluteUrl = (path: string) => joinURL(config.public.siteUrl, path)

  return { withBase, absoluteUrl }
}
