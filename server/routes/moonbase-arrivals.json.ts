/**
 * The latest module version updates across the moonbase repositories on GitHub, for the
 * "Arrivals" board on the homepage. Fetched at build time (prerendered), so visitors never call
 * GitHub. If GitHub can't be reached, the list is empty and the board is left out.
 *
 * Set GITHUB_TOKEN (CI does) to avoid GitHub's limit of 60 unauthenticated requests an hour.
 */
const OWNER = 'lunar-linux'
const REPOSITORIES = [
  'moonbase-core', 'moonbase-other', 'moonbase-xorg', 'moonbase-kde',
  'moonbase-gnome3', 'moonbase-gnome', 'moonbase-xfce', 'moonbase-efl'
]
const DAYS = 30
const SHOWN = 8
// At most this many rows per moonbase section, so one busy evening doesn't fill the board
const PER_GATE = 3
const MAX_PAGES = 3 // 300 commits per repository is plenty for a 30-day count

type Commit = {
  sha: string
  html_url: string
  author: { login: string } | null
  commit: { message: string, author: { name: string }, committer: { date: string } }
}

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

export type MoonbaseArrivals = { arrivals: Arrival[], total: number, days: number }

/** Fetches and parses the commits. Cached for an hour (handy in dev); a failure throws and isn't cached. */
const fetchArrivals = defineCachedFunction(async (): Promise<MoonbaseArrivals> => {
  const since = new Date(Date.now() - DAYS * 86_400_000).toISOString()
  const headers: Record<string, string> = { 'accept': 'application/vnd.github+json', 'user-agent': 'lunar-www' }
  if (process.env.GITHUB_TOKEN) headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`

  const commitsOf = async (repository: string) => {
    const commits: Commit[] = []
    for (let page = 1; page <= MAX_PAGES; page++) {
      const batch = await $fetch<Commit[]>(`https://api.github.com/repos/${OWNER}/${repository}/commits`, {
        headers,
        query: { since, per_page: 100, page },
        timeout: 10_000
      })
      commits.push(...batch)
      if (batch.length < 100) break
    }
    return commits
  }

  const bumps: Arrival[] = []
  for (const repository of REPOSITORIES) {
    const reverted = new Set<string>()
    // Newest first, so a revert is seen before the commit it reverts.
    for (const { commit, html_url, author } of await commitsOf(repository)) {
      const subject = commit.message.split('\n')[0]!.trim()
      const revert = revertedSubject(subject)
      if (revert) {
        reverted.add(revert)
        continue
      }
      if (reverted.has(subject)) continue
      const bump = parseVersionBump(subject)
      if (bump) {
        bumps.push({
          ...bump,
          gate: repository.replace(/^moonbase-/, ''),
          crew: author?.login ?? commit.author.name,
          date: commit.committer.date,
          url: html_url
        })
      }
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
  return { arrivals, total: bumps.length, days: DAYS }
}, { maxAge: 60 * 60, name: 'moonbase-arrivals' })

export default defineEventHandler(async (): Promise<MoonbaseArrivals> => {
  try {
    return await fetchArrivals()
  } catch (error) {
    console.warn(`[moonbase-arrivals] GitHub unavailable, leaving the board out: ${(error as Error).message}`)
    return { arrivals: [], total: 0, days: DAYS }
  }
})
