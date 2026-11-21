/*
 * Recent module version updates across the moonbase repositories, for the "Arrivals" board on the
 * homepage. Used by the prerendered route (server/routes/moonbase-arrivals.json.ts) and by the
 * feed workflow (scripts/moonbase-feed.ts, run directly by Node), so this file has no imports and
 * only uses TypeScript that Node can strip.
 */

export const MOONBASE_OWNER = 'lunar-linux'
export const MOONBASE_REPOSITORIES = [
  'moonbase-core', 'moonbase-other', 'moonbase-xorg', 'moonbase-kde',
  'moonbase-gnome3', 'moonbase-gnome', 'moonbase-xfce', 'moonbase-efl'
]
const DAYS = 30
const SHOWN = 8
// At most this many rows per moonbase section, so one busy evening doesn't fill the board
const PER_GATE = 3
const MAX_PAGES = 3 // 300 commits per repository is plenty for a 30-day count

/** A module version update found in a moonbase commit message. */
export type VersionBump = { module: string, version: string }

export type Arrival = {
  module: string
  version: string
  /** Moonbase section, e.g. "core" for moonbase-core */
  gate: string
  /** Who landed it: the GitHub login, or the commit's author name */
  crew: string
  date: string
  url: string
}

export type MoonbaseArrivals = {
  arrivals: Arrival[]
  /** Version updates in the last `days` days */
  total: number
  days: number
  /** When this was put together (ISO date) */
  generatedAt: string
}

/** The parts of a GitHub API commit we use. */
export type Commit = {
  html_url: string
  author: { login: string } | null
  commit: { message: string, author: { name: string }, committer: { date: string } }
}

/*
 * Moonbase commit subjects look like:
 *   "pkgconf: Bump to 3.0.11."            "linux: version bumped to 7.3.4"
 *   "grub2: Bump to 2.16 (#4368)"         "kmod: version bumped to 34.3 (retake …)"
 *   "foo: updated to 1.2", "foo: upgrade to v2.0"
 */
const BUMP = /^([\w.+-]+):\s*(?:version\s+)?(?:bump(?:ed)?|update[ds]?|upgrade[ds]?)\s+(?:version\s+)?(?:to\s+)?v?(\d[\w.+~-]*)/i

/** The module and new version from a commit subject, or null if it isn't a version update. */
export const parseVersionBump = (subject: string): VersionBump | null => {
  const match = subject.trim().match(BUMP)
  if (!match) return null
  const [, module, version] = match
  return { module: module!, version: version!.replace(/[.,;:]+$/, '') }
}

/** Subject of the commit a `Revert "…"` commit reverts, or null. */
export const revertedSubject = (subject: string) => subject.match(/^Revert "(.+)"$/)?.[1] ?? null

/**
 * Turns each repository's commits (newest first) into the board: version updates only, reverted
 * ones dropped, newest first, one row per module, at most PER_GATE rows per section.
 */
export const summarizeArrivals = (
  repositories: { repository: string, commits: Commit[] }[],
  now = new Date()
): MoonbaseArrivals => {
  const bumps: Arrival[] = []
  for (const { repository, commits } of repositories) {
    const reverted = new Set<string>()
    // Newest first, so a revert is seen before the commit it reverts.
    for (const { commit, html_url, author } of commits) {
      const subject = commit.message.split('\n')[0]!.trim()
      const revert = revertedSubject(subject)
      if (revert) {
        reverted.add(revert)
        continue
      }
      if (reverted.has(subject)) continue
      const bump = parseVersionBump(subject)
      if (!bump) continue
      bumps.push({
        ...bump,
        gate: repository.replace(/^moonbase-/, ''),
        crew: author?.login ?? commit.author.name,
        date: commit.committer.date,
        url: html_url
      })
    }
  }

  bumps.sort((a, b) => b.date.localeCompare(a.date))
  const seen = new Set<string>()
  const perGate = new Map<string, number>()
  const arrivals: Arrival[] = []
  for (const bump of bumps) {
    if (arrivals.length === SHOWN) break
    if (seen.has(bump.module) || (perGate.get(bump.gate) ?? 0) >= PER_GATE) continue
    seen.add(bump.module)
    perGate.set(bump.gate, (perGate.get(bump.gate) ?? 0) + 1)
    arrivals.push(bump)
  }
  return { arrivals, total: bumps.length, days: DAYS, generatedAt: now.toISOString() }
}

/**
 * Fetches the last DAYS days of commits from every moonbase repository and summarizes them.
 * Throws if GitHub can't be reached. Pass a token to avoid the limit of 60 requests an hour.
 */
export const fetchMoonbaseArrivals = async (token?: string): Promise<MoonbaseArrivals> => {
  const since = new Date(Date.now() - DAYS * 86_400_000).toISOString()
  const headers: Record<string, string> = { 'accept': 'application/vnd.github+json', 'user-agent': 'lunar-www' }
  if (token) headers.authorization = `Bearer ${token}`

  const commitsOf = async (repository: string) => {
    const commits: Commit[] = []
    for (let page = 1; page <= MAX_PAGES; page++) {
      const url = `https://api.github.com/repos/${MOONBASE_OWNER}/${repository}/commits?since=${since}&per_page=100&page=${page}`
      const response = await fetch(url, { headers, signal: AbortSignal.timeout(10_000) })
      if (!response.ok) throw new Error(`GET ${url}: ${response.status} ${response.statusText}`)
      const batch = await response.json() as Commit[]
      commits.push(...batch)
      if (batch.length < 100) break
    }
    return commits
  }

  const repositories = []
  for (const repository of MOONBASE_REPOSITORIES) {
    repositories.push({ repository, commits: await commitsOf(repository) })
  }
  return summarizeArrivals(repositories)
}
