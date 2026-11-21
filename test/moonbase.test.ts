import { describe, expect, it } from 'vitest'
import { landingDates, parseVersionBump, revertedSubject, summarizeArrivals, type Commit } from '../server/utils/moonbase'

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
  const commit = (subject: string, minutesAgo = minute++, login: string | null = 'stumbles', parents: string[] = []): Commit => ({
    sha: `sha-${minutesAgo}`,
    parents: parents.map(sha => ({ sha })),
    html_url: `https://github.com/lunar-linux/x/commit/${minutesAgo}`,
    author: login ? { login } : null,
    commit: {
      message: `${subject}\n\nbody`,
      author: { name: 'Dennis Veatch', email: 'dennis@example.org' },
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

  describe('updates merged from a pull request', () => {
    // Like firefox 160.0 in moonbase-other (#7571): committed days before the merge
    const DAY = 24 * 60
    const history = () => [
      commit('Merge pull request #7571 from esselfe/firefox-160.0', 10, null, ['sha-15', 'firefox']),
      commit('atuin: Version bumped to 18.25.1', 15, 'Ratler', ['sha-20']),
      commit('nss: version bumped to 3.134', 20, 'florin65', ['sha-30']),
      commit('HTML-Parser: version bumped to 3.87', 30, 'florin65', ['firmware']),
      { ...commit('firefox: version bumped to 160.0', 6 * DAY, 'esselfe', ['firmware']), sha: 'firefox' },
      { ...commit('linux-firmware: Bump to 1.0.', 7 * DAY, 'florin65'), sha: 'firmware' }
    ]

    it('dates them by the merge, not by when they were written', () => {
      const board = summarizeArrivals([{ repository: 'moonbase-other', commits: history() }], now)
      expect(board.arrivals[0]).toMatchObject({ module: 'firefox', date: '2026-11-20T11:50:00.000Z' })
    })

    it('reaches the board when the section is full of updates written after it', () => {
      const board = summarizeArrivals([{ repository: 'moonbase-other', commits: history() }], now)
      expect(board.arrivals.map(a => a.module)).toEqual(['firefox', 'atuin', 'nss'])
      expect(board.total).toBe(5)
    })

    it('keeps the commit date for commits on the branch itself', () => {
      const commits = history()
      const dates = landingDates(commits)
      expect(dates.get('sha-20')).toBe(commits[2]!.commit.committer.date)
      expect(dates.get('firmware')).toBe(commits[5]!.commit.committer.date)
    })

    it('dates a branch merged twice by the merge that first brought each commit in', () => {
      const commits = [
        commit('Merge branch fix', 1, null, ['sha-2', 'sha-3']),
        commit('Merge branch fix', 2, null, ['sha-5', 'sha-4']),
        commit('foo: Bump to 2.0.', 3, 'stumbles', ['sha-4']),
        commit('foo: Bump to 1.0.', 4, 'stumbles', ['sha-5']),
        commit('bar: small tweak', 5)
      ]
      const dates = landingDates(commits)
      expect(dates.get('sha-3')).toBe(commits[0]!.commit.committer.date)
      expect(dates.get('sha-4')).toBe(commits[1]!.commit.committer.date)
      expect(dates.get('sha-5')).toBe(commits[4]!.commit.committer.date)
    })
  })

  it('credits the commit author name when there is no GitHub login', () => {
    const board = summarizeArrivals([{ repository: 'moonbase-core', commits: [commit('nano: Bump to 8.6.', 1, null)] }], now)
    expect(board.arrivals[0]!.crew).toBe('Dennis Veatch')
  })

  describe('updates committed by Lunar Bot', () => {
    // Like atuin 18.25.1 in moonbase-other (859f929): the bot authors it, the person is a co-author
    const botCommit = (subject: string, minutesAgo: number, coAuthors: string[]): Commit => ({
      sha: `bot-${minutesAgo}`,
      parents: [],
      html_url: `https://github.com/lunar-linux/x/commit/${minutesAgo}`,
      author: null,
      commit: {
        message: [subject, '', ...coAuthors.map(person => `Co-authored-by: ${person}`)].join('\n'),
        author: { name: 'Lunar Bot', email: 'bot@lunar-linux.org' },
        committer: { date: new Date(Date.UTC(2026, 10, 20, 12) - minutesAgo * 60_000).toISOString() }
      }
    })
    const byAda: Commit = {
      sha: 'ada',
      parents: [],
      html_url: 'https://github.com/lunar-linux/x/commit/ada',
      author: { login: 'adamoon' },
      commit: {
        message: 'nano: small tweak',
        author: { name: 'Ada Moon', email: 'ada@example.org' },
        committer: { date: '2026-11-19T12:00:00Z' }
      }
    }
    const crewOf = (...commits: Commit[]) =>
      summarizeArrivals([{ repository: 'moonbase-other', commits }], now).arrivals[0]!.crew

    it('credits the co-author, by the GitHub login their email has on other commits', () => {
      expect(crewOf(botCommit('atuin: Version bumped to 18.25.1', 1, ['Ada Moon <ada@example.org>']), byAda))
        .toBe('adamoon')
    })

    it('matches the email in any letter case, across repositories', () => {
      const board = summarizeArrivals([
        { repository: 'moonbase-other', commits: [botCommit('atuin: Version bumped to 18.25.1', 1, ['Ada Moon <Ada@Example.org>'])] },
        { repository: 'moonbase-core', commits: [byAda] }
      ], now)
      expect(board.arrivals[0]!.crew).toBe('adamoon')
    })

    it('reads the login from a GitHub noreply email', () => {
      expect(crewOf(botCommit('atuin: Version bumped to 18.25.1', 1, ['Max Crater <12345+maxcrater@users.noreply.github.com>'])))
        .toBe('maxcrater')
    })

    it('falls back to the co-author name when the email has no known login', () => {
      expect(crewOf(botCommit('atuin: Version bumped to 18.25.1', 1, ['Ada Moon <ada@example.org>'])))
        .toBe('Ada Moon')
    })

    it('skips bot co-authors', () => {
      expect(crewOf(botCommit('atuin: Version bumped to 18.25.1', 1, [
        'Lunar Bot <bot@lunar-linux.org>',
        'Ada Moon <ada@example.org>'
      ]), byAda)).toBe('adamoon')
    })

    it('stays with the bot when nobody co-authored it', () => {
      expect(crewOf(botCommit('atuin: Version bumped to 18.25.1', 1, []))).toBe('Lunar Bot')
    })

    it('keeps a person as crew when the bot is only their co-author', () => {
      const withBot = commit('nano: Bump to 8.7.', 1, 'adamoon')
      withBot.commit.message += '\n\nCo-authored-by: Lunar Bot <bot@lunar-linux.org>'
      expect(crewOf(withBot)).toBe('adamoon')
    })
  })
})
