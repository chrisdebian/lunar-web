import { describe, expect, it } from 'vitest'
import { docsBreadcrumbs, navCurrent } from '../app/utils/navigation'

describe('navCurrent', () => {
  it('marks the link to the page you are on', () => {
    expect(navCurrent('/docs', '/docs')).toBe('page')
    expect(navCurrent('/download/', '/download')).toBe('page')
  })

  it('marks a section link on the pages below it', () => {
    expect(navCurrent('/docs/package-management/lin', '/docs')).toBe('true')
    expect(navCurrent('/news/2017-10-18-we-are-still-very-much-alive', '/news')).toBe('true')
  })

  it('does not match a path that only shares a prefix', () => {
    expect(navCurrent('/newsletter', '/news')).toBeUndefined()
  })

  it('does not light up Home everywhere', () => {
    expect(navCurrent('/docs', '/')).toBeUndefined()
    expect(navCurrent('/', '/')).toBe('page')
  })

  it('never marks a homepage anchor', () => {
    expect(navCurrent('/', '/#community')).toBeUndefined()
  })
})

describe('docsBreadcrumbs', () => {
  const titles = new Map([['/docs/package-management', 'Package Management']])

  it('starts at Documentation', () => {
    expect(docsBreadcrumbs('/docs', titles)).toEqual([{ label: 'Documentation', path: '/docs' }])
  })

  it('uses page titles, then the current title, then the slug', () => {
    expect(docsBreadcrumbs('/docs/package-management/using-lin', titles, 'Using lin')).toEqual([
      { label: 'Documentation', path: '/docs' },
      { label: 'Package Management', path: '/docs/package-management' },
      { label: 'Using lin', path: '/docs/package-management/using-lin' }
    ])
    expect(docsBreadcrumbs('/docs/system-administration/x', new Map()).at(1))
      .toEqual({ label: 'System Administration', path: '/docs/system-administration' })
  })
})
