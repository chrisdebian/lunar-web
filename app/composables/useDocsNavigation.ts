export type DocNavItem = {
  title: string
  path: string
  order?: number
  children: DocNavItem[]
}

const byOrderThenTitle = (a: DocNavItem, b: DocNavItem) =>
  (a.order ?? Number.POSITIVE_INFINITY) - (b.order ?? Number.POSITIVE_INFINITY)
  || a.title.localeCompare(b.title)

/** Turns a flat list of doc pages into a tree keyed by URL path (`/docs/a/b` is a child of `/docs/a`). */
export const buildDocsTree = (pages: Array<Omit<DocNavItem, 'children'>>, rootPath = '/docs'): DocNavItem[] => {
  const nodes = new Map<string, DocNavItem>(
    pages.map(page => [page.path, { ...page, children: [] }])
  )
  const roots: DocNavItem[] = []

  for (const node of nodes.values()) {
    if (node.path === rootPath) continue
    const parentPath = node.path.slice(0, node.path.lastIndexOf('/'))
    const parent = parentPath === rootPath ? undefined : nodes.get(parentPath)
    if (parent) parent.children.push(node)
    else roots.push(node)
  }

  const sortTree = (items: DocNavItem[]) => {
    items.sort(byOrderThenTitle)
    items.forEach(item => sortTree(item.children))
    return items
  }

  return sortTree(roots)
}

/** The full documentation tree, shared by every docs page through the payload. */
export const useDocsNavigation = () =>
  useAsyncData('docs-navigation', async () => {
    const pages = await queryCollection('docs').select('title', 'path', 'order').all()
    return buildDocsTree(pages.map(page => ({
      title: page.title || 'Untitled',
      path: page.path,
      order: page.order
    })))
  }, { default: () => [] })
