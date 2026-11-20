import { describe, expect, it } from 'vitest'
import { buildDocsTree, type DocNavItem } from '../app/composables/useDocsNavigation'

/** Titles only, nested like the tree, for readable expectations. */
type Shape = string | [string, Shape[]]
const shape = (items: DocNavItem[]): Shape[] =>
  items.map(item => item.children.length ? [item.title, shape(item.children)] : item.title)

describe('buildDocsTree', () => {
  it('nests pages by URL path and leaves out the docs root', () => {
    const tree = buildDocsTree([
      { title: 'Docs', path: '/docs' },
      { title: 'Installation', path: '/docs/installation' },
      { title: 'Requirements', path: '/docs/installation/requirements' },
      { title: 'Kernel parameters', path: '/docs/installation/advanced/kernel-parameters' },
      { title: 'Advanced', path: '/docs/installation/advanced' },
      { title: 'FAQ', path: '/docs/faq' }
    ])
    expect(shape(tree)).toEqual([
      'FAQ',
      ['Installation', [['Advanced', ['Kernel parameters']], 'Requirements']]
    ])
  })

  it('sorts by order first, then pages without an order by title', () => {
    const tree = buildDocsTree([
      { title: 'Zebra', path: '/docs/zebra' },
      { title: 'Apple', path: '/docs/apple' },
      { title: 'Second', path: '/docs/second', order: 2 },
      { title: 'First', path: '/docs/first', order: 1 }
    ])
    expect(shape(tree)).toEqual(['First', 'Second', 'Apple', 'Zebra'])
  })

  it('puts a page whose parent has no page of its own at the top level', () => {
    const tree = buildDocsTree([
      { title: 'Orphan', path: '/docs/missing-section/orphan' },
      { title: 'FAQ', path: '/docs/faq' }
    ])
    expect(shape(tree)).toEqual(['FAQ', 'Orphan'])
  })
})
