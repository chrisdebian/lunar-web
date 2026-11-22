import { describe, expect, it } from 'vitest'
import { searchModules } from '../app/utils/moduleSearch'
import type { ModuleSummary } from '../shared/types/moonbase-index'

const module = (name: string, short: string, extra: Partial<ModuleSummary> = {}): ModuleSummary =>
  ({ name, version: '1.0', section: 'web', short, ...extra })

const modules = [
  module('firefox-bin', 'Firefox, prebuilt by Mozilla'),
  module('firefox', 'A web browser from mozilla.org'),
  module('lynx', 'Text web browser'),
  module('fire', 'Something called fire'),
  module('old-firefox', 'An old copy', { crater: true }),
  module('epiphany', 'GNOME web browser'),
  module('zfirefoxtools', 'Tools')
]
const names = (query: string) => searchModules(modules, query).map(found => found.name)

describe('searchModules', () => {
  it('puts the exact name first, then names starting with it, then names containing it', () => {
    expect(names('firefox')).toEqual(['firefox', 'firefox-bin', 'zfirefoxtools', 'old-firefox'])
  })

  it('ranks crater modules below active ones', () => {
    expect(names('fire').at(-1)).toBe('old-firefox')
  })

  it('finds every word in the name and description', () => {
    expect(names('web browser')).toEqual(['lynx', 'firefox', 'epiphany'])
  })

  it('ignores case and spaces around the query, and finds nothing for an empty one', () => {
    expect(names('  LYNX ')).toEqual(['lynx'])
    expect(names('   ')).toEqual([])
    expect(names('nothing-like-this')).toEqual([])
  })
})
