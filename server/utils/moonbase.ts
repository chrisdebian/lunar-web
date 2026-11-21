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
  /**
   * Who landed it: the GitHub login, or the commit's author name. For a bot's commit, the person
   * it co-authored with (see `crewOf`).
   */
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
  sha: string
  /** First parent first; a merge commit has two */
  parents: { sha: string }[]
  html_url: string
  author: { login: string } | null
  commit: { message: string, author: { name: string, email: string }, committer: { date: string } }
}

/*
 * Lunar Bot opens the version-bump PRs in moonbase-other and authors their commits, with the person
 * who asked for the update as a co-author ("Co-authored-by: Name <email>").
 * The board credits that person.
 */
const BOT_EMAILS = new Set(['bot@lunar-linux.org'])
const isBot = (email: string, login?: string) =>
  BOT_EMAILS.has(email.toLowerCase()) || /\[bot\]$/.test(login ?? '') || /\[bot\]@users\.noreply\.github\.com$/i.test(email)

const CO_AUTHOR = /^co-authored-by:\s*(.+?)\s*<([^>]+)>\s*$/gim
// 12345+login@users.noreply.github.com, or login@users.noreply.github.com for older accounts
const NOREPLY = /^(?:\d+\+)?([\w-]+)@users\.noreply\.github\.com$/i

/** Co-authors from a commit message's `Co-authored-by:` trailers. */
export const coAuthorsOf = (message: string) =>
  [...message.matchAll(CO_AUTHOR)].map(([, name, email]) => ({ name: name!, email: email! }))

/**
 * Who landed a commit: the author's GitHub login or name. If a bot authored it, the first person
 * who co-authored it, by the login their email has (`logins`, from other commits, or a GitHub
 * noreply address), or else by name.
 */
const crewOf = ({ author, commit }: Commit, logins: Map<string, string>) => {
  if (isBot(commit.author.email, author?.login)) {
    const person = coAuthorsOf(commit.message).find(({ email }) => !isBot(email))
    if (person) {
      const email = person.email.toLowerCase()
      return logins.get(email) ?? email.match(NOREPLY)?.[1] ?? person.name
    }
  }
  return author?.login ?? commit.author.name
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
 * When each commit landed on the branch (newest commit first in `commits`). A commit brought in by
 * a merge landed when it was merged, which can be days after it was written: firefox 160.0 in
 * moonbase-other was committed on Nov 15 and merged on Nov 21. Commits on the branch's own line
 * (the newest commit and its first parents) landed when they were committed. Commits this can't
 * place are left out; they count from their own date.
 */
export const landingDates = (commits: Commit[]) => {
  const bySha = new Map(commits.map(entry => [entry.sha, entry]))
  const mainline: Commit[] = []
  const onMainline = new Set<string>()
  for (let entry = commits[0]; entry && !onMainline.has(entry.sha); entry = bySha.get(entry.parents[0]?.sha ?? '')) {
    mainline.push(entry)
    onMainline.add(entry.sha)
  }

  const landed = new Map<string, string>()
  // Oldest first, so a branch merged twice dates each commit by the merge that first brought it in
  for (const merge of mainline.reverse()) {
    const date = merge.commit.committer.date
    landed.set(merge.sha, date)
    const queue = merge.parents.slice(1).map(({ sha }) => sha)
    while (queue.length) {
      const entry = bySha.get(queue.pop()!)
      if (!entry || onMainline.has(entry.sha) || landed.has(entry.sha)) continue
      landed.set(entry.sha, date)
      queue.push(...entry.parents.map(({ sha }) => sha))
    }
  }
  return landed
}

/**
 * Turns each repository's commits (newest first) into the board: version updates only, reverted
 * ones dropped, newest first, one row per module, at most PER_GATE rows per section.
 */
export const summarizeArrivals = (
  repositories: { repository: string, commits: Commit[] }[],
  now = new Date()
): MoonbaseArrivals => {
  // Email → GitHub login, from every commit GitHub linked to an account
  const logins = new Map<string, string>()
  for (const { commits } of repositories) {
    for (const { commit, author } of commits) {
      if (author && !isBot(commit.author.email, author.login)) logins.set(commit.author.email.toLowerCase(), author.login)
    }
  }

  const bumps: Arrival[] = []
  for (const { repository, commits } of repositories) {
    const landed = landingDates(commits)
    const reverted = new Set<string>()
    // Newest first, so a revert is seen before the commit it reverts.
    for (const entry of commits) {
      const { commit, html_url } = entry
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
        crew: crewOf(entry, logins),
        date: landed.get(entry.sha) ?? commit.committer.date,
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

  const get = async <T>(url: string) => {
    const response = await fetch(url, { headers, signal: AbortSignal.timeout(10_000) })
    if (!response.ok) throw new Error(`GET ${url}: ${response.status} ${response.statusText}`)
    return await response.json() as T
  }

  const commitsOf = async (repository: string) => {
    const api = `https://api.github.com/repos/${MOONBASE_OWNER}/${repository}`
    const commits: Commit[] = []
    for (let page = 1; page <= MAX_PAGES; page++) {
      const batch = await get<Commit[]>(`${api}/commits?since=${since}&per_page=100&page=${page}`)
      commits.push(...batch)
      if (batch.length < 100) break
    }
    // `since` goes by commit date, so a pull request that was open for longer than DAYS is merged
    // without its commits. Fetch what such a merge brought in.
    const known = new Set(commits.map(({ sha }) => sha))
    for (const merge of commits.filter(({ parents }) => parents.length > 1)) {
      const [base, head] = merge.parents
      if (known.has(head!.sha)) continue
      const { commits: merged } = await get<{ commits: Commit[] }>(`${api}/compare/${base!.sha}...${head!.sha}`)
      for (const entry of merged.reverse()) {
        if (known.has(entry.sha)) continue
        known.add(entry.sha)
        commits.push(entry)
      }
    }
    return commits
  }

  const repositories = []
  for (const repository of MOONBASE_REPOSITORIES) {
    repositories.push({ repository, commits: await commitsOf(repository) })
  }
  return summarizeArrivals(repositories)
}
