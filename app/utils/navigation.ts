import { withoutTrailingSlash } from 'ufo'

export type Crumb = {
  label: string
  path: string
}

/**
 * How a header link relates to the current route, as an `aria-current` value:
 * 'page' on the link's own page, 'true' anywhere below it (a docs page lights up "Docs"),
 * undefined elsewhere. Hash links (`/#community`) are never marked: they're a spot on the
 * homepage, not a place you can be.
 */
export const navCurrent = (currentPath: string, linkPath: string): 'page' | 'true' | undefined => {
  if (linkPath.includes('#')) return undefined
  const current = withoutTrailingSlash(currentPath) || '/'
  const link = withoutTrailingSlash(linkPath) || '/'
  if (current === link) return 'page'
  if (link !== '/' && current.startsWith(`${link}/`)) return 'true'
  return undefined
}

/** "package-management" → "Package Management", for crumbs that have no page title. */
const humanize = (slug: string) =>
  slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')

/**
 * Breadcrumb trail for a docs page, after "Home": Documentation › section › … › page.
 * `titles` maps doc paths to page titles so crumbs read "Package Management", not the slug.
 */
export const docsBreadcrumbs = (path: string, titles: Map<string, string>, currentTitle?: string): Crumb[] => {
  const crumbs: Crumb[] = [{ label: 'Documentation', path: '/docs' }]
  const segments = withoutTrailingSlash(path).split('/').filter(Boolean).slice(1) // drop "docs"

  let trail = '/docs'
  segments.forEach((segment, index) => {
    trail += `/${segment}`
    const isLast = index === segments.length - 1
    crumbs.push({ label: (isLast && currentTitle) || titles.get(trail) || humanize(segment), path: trail })
  })

  return crumbs
}
