import { describe, expect, it } from 'vitest'
import { parseVersionBump, revertedSubject, summarizeArrivals, type Commit } from '../server/utils/moonbase'

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

describe('summarizeArrivals', () => {
  let minute = 0
  /** A commit from the API, `minutesAgo` before 2026-11-20 12:00 UTC. */
  const commit = (subject: string, minutesAgo = minute++, login: string | null = 'stumbles'): Commit => ({
    html_url: `https://github.com/lunar-linux/x/commit/${minutesAgo}`,
    author: login ? { login } : null,
    commit: {
      message: `${subject}\n\nbody`,
      author: { name: 'Dennis Veatch' },
      committer: { date: new Date(Date.UTC(2026, 10, 20, 12) - minutesAgo * 60_000).toISOString() }
    }
  })
  const now = new Date('2026-11-20T12:00:00Z')

  it('lists version updates newest first, across repositories', () => {
    const board = summarizeArrivals([
      { repository: 'moonbase-core', commits: [commit('linux: Bump to 7.3.5.', 5), commit('Merge pull request #1', 6)] },
      { repository: 'moonbase-xorg', commits: [commit('mesa-lib: Bump to 26.3.1.', 1)] }
    ], now)
    expect(board.arrivals.map(a => `${a.gate}/${a.module} ${a.version}`)).toEqual(['xorg/mesa-lib 26.3.1', 'core/linux 7.3.5'])
    expect(board.total).toBe(2)
    expect(board.generatedAt).toBe('2026-11-20T12:00:00.000Z')
  })

  it('drops reverted updates', () => {
    const board = summarizeArrivals([{
      repository: 'moonbase-core',
      commits: [
        commit('kmod: version bumped to 34.3 (retake)', 1),
        commit('Revert "kmod: version bumped to 34.3"', 2),
        commit('kmod: version bumped to 34.3', 3)
      ]
    }], now)
    expect(board.arrivals).toHaveLength(1)
    expect(board.arrivals[0]!.url).toContain('/commit/1')
    expect(board.total).toBe(1)
  })

  it('shows each module once, with its newest version', () => {
    const board = summarizeArrivals([{
      repository: 'moonbase-core',
      commits: [commit('linux: Bump to 7.3.5.', 1), commit('linux: Bump to 7.3.4.', 2)]
    }], now)
    expect(board.arrivals.map(a => a.version)).toEqual(['7.3.5'])
    expect(board.total).toBe(2)
  })

  it('shows at most 3 rows per section and 8 rows in all', () => {
    const many = (repository: string, count: number, offset: number) => ({
      repository,
      commits: Array.from({ length: count }, (_, i) => commit(`${repository}-m${i}: Bump to 1.${i}.`, offset + i))
    })
    const board = summarizeArrivals([many('moonbase-other', 10, 0), many('moonbase-core', 10, 100), many('moonbase-kde', 10, 200)], now)
    const perGate = Object.groupBy(board.arrivals, a => a.gate)
    expect(board.arrivals).toHaveLength(8)
    expect(perGate.other).toHaveLength(3)
    expect(perGate.core).toHaveLength(3)
    expect(perGate.kde).toHaveLength(2)
    expect(board.total).toBe(30)
  })

  it('credits the commit author name when there is no GitHub login', () => {
    const board = summarizeArrivals([{ repository: 'moonbase-core', commits: [commit('nano: Bump to 8.6.', 1, null)] }], now)
    expect(board.arrivals[0]!.crew).toBe('Dennis Veatch')
  })
})
