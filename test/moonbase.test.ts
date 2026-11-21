import { describe, expect, it } from 'vitest'
import { parseVersionBump, revertedSubject } from '../server/utils/moonbase'

describe('parseVersionBump', () => {
  // Real commit subjects from the moonbase repositories
  it.each([
    ['pkgconf: Bump to 3.0.11.', 'pkgconf', '3.0.11'],
    ['linux: version bumped to 7.3.4', 'linux', '7.3.4'],
    ['grub2: Bump to 2.16 (#4368)', 'grub2', '2.16'],
    ['kmod: version bumped to 34.3 (retake after merging too fast, I doubt it was tested)', 'kmod', '34.3'],
    ['openssh: version bumped to 10.6p2', 'openssh', '10.6p2'],
    ['mesa-lib: Bump to 26.3.1.', 'mesa-lib', '26.3.1'],
    ['gtk+-3: updated to 3.24.50', 'gtk+-3', '3.24.50'],
    ['foo: upgrade to v2.0.1', 'foo', '2.0.1']
  ])('%s', (subject, module, version) => {
    expect(parseVersionBump(subject)).toEqual({ module, version })
  })

  it.each([
    'Merge pull request #4373 from stumbles/flex',
    'plotutils: optional_depends libxmi is fine now.',
    'ca-certificates: remove compromised certificate',
    'Revert "kmod: version bumped to 34.3"',
    'gcc: Needs -std=gnu17.'
  ])('ignores %s', (subject) => {
    expect(parseVersionBump(subject)).toBeNull()
  })
})

describe('revertedSubject', () => {
  it('returns the subject of the reverted commit', () => {
    expect(revertedSubject('Revert "kmod: version bumped to 34.3"')).toBe('kmod: version bumped to 34.3')
  })

  it('returns null for other commits', () => {
    expect(revertedSubject('kmod: version bumped to 34.3')).toBeNull()
  })
})
