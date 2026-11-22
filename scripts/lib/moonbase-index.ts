/*
 * Builds the moonbase module index (shared/types/moonbase-index.ts) from local copies of the
 * moonbase repositories. scripts/moonbase-index.mjs clones or updates them and calls
 * `buildMoonbaseIndex`; the tests call it on a small fixture moonbase.
 *
 * Only Node built-ins and TypeScript that Node can strip: the script runs it without an install.
 */

import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { basename, dirname, join } from 'node:path'
import { coAuthorsOf, isBot, parseVersionBump } from '../../server/utils/moonbase.ts'
import type {
  ModuleCommit, ModuleDependency, ModuleDependent, ModuleVersionChange, MoonbaseIndex, MoonbaseModule,
  MoonbaseRepository
} from '../../shared/types/moonbase-index.ts'
import {
  isoDay, LUNAR_URLS, parseAliases, parseConfigure, parseDepends, parseDetails, type Details, type RawDependency
} from './moonbase-parse.ts'

/** Version bumps kept per module */
const HISTORY = 5

export type RepositoryCopy = {
  /** Full name: moonbase-core */
  name: string
  /** A local copy: a git clone, or a plain folder (then there's no history) */
  dir: string
}

type Found = { name: string, repo: string, path: string, dir: string }

/** Every folder with a DETAILS file, as `section/…/module` paths. zlocal and dot folders are skipped. */
const findModules = (repo: RepositoryCopy): Found[] => {
  const found: Found[] = []
  const visit = (dir: string, path: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory() || entry.name.startsWith('.') || entry.name === 'zlocal') continue
      const child = join(dir, entry.name)
      const childPath = path ? `${path}/${entry.name}` : entry.name
      if (existsSync(join(child, 'DETAILS'))) found.push({ name: entry.name, repo: repo.name, path: childPath, dir: child })
      else visit(child, childPath)
    }
  }
  visit(repo.dir, '')
  return found
}

const read = (dir: string, file: string) => {
  const path = join(dir, file)
  return existsSync(path) ? readFileSync(path, 'utf8') : null
}

const count = (dir: string) => (existsSync(dir) ? readdirSync(dir).filter(name => !name.startsWith('.')).length : 0)

const git = (dir: string, args: string[]) =>
  execFileSync('git', args, { cwd: dir, encoding: 'utf8', maxBuffer: 1 << 30, stdio: ['ignore', 'pipe', 'pipe'] })

// ---------------------------------------------------------------------------------------------
// History
// ---------------------------------------------------------------------------------------------

/** `git log` format for `authorLog`: one record per commit. */
export const AUTHOR_FORMAT = '%x1e%H%x1f%an%x1f%ae%x1f%s%x1f%(trailers:key=Co-authored-by,separator=%x1d)'
/** `git log --first-parent` format for `landedLog`, followed by the files it changed. */
export const LANDED_FORMAT = '%x1e%H%x1f%P%x1f%cI'

type Author = { name: string, email: string, subject: string, trailers: string }

/** Credits a commit to its author, or for a bot's commit to the first person who co-authored it. */
const credit = ({ name, email, trailers }: Author) => {
  if (isBot(email)) {
    const person = coAuthorsOf(trailers).find(coAuthor => !isBot(coAuthor.email))
    if (person) return person.name
  }
  return name
}

export type ModuleHistory = { lastChange: ModuleCommit | null, history: ModuleVersionChange[] }

/**
 * Each module's latest change and recent version bumps, from two `git log` outputs:
 * - `authorLog`: every commit's author, subject and co-authors (AUTHOR_FORMAT)
 * - `landedLog`: what landed on master, newest first, each with the files it changed against the
 *   previous master (LANDED_FORMAT, `--first-parent --diff-merges=first-parent --name-only`)
 *
 * A merge is dated when it landed and credited to the pull request's last commit, so a change
 * that waited in review isn't shown as older than it is, nor credited to whoever merged it.
 */
export const parseHistory = (authorLog: string, landedLog: string, modulePaths: Iterable<string>) => {
  const authors = new Map<string, Author>()
  for (const record of authorLog.split('\x1e')) {
    const [sha, name, email, subject, trailers] = record.replace(/\n$/, '').split('\x1f')
    if (sha) authors.set(sha, { name: name ?? '', email: email ?? '', subject: subject ?? '', trailers: (trailers ?? '').replaceAll('\x1d', '\n') })
  }

  const paths = new Set(modulePaths)
  const moduleOf = (file: string) => {
    for (let dir = dirname(file); dir !== '.' && dir !== '/'; dir = dirname(dir)) if (paths.has(dir)) return dir
    return null
  }

  const result = new Map<string, ModuleHistory>()
  for (const record of landedLog.split('\x1e')) {
    const [header, ...files] = record.split('\n')
    const [sha, parents = '', date] = header!.split('\x1f')
    if (!sha || !date) continue
    const work = parents.split(' ')[1] ?? sha // a merge: the pull request's last commit
    const author = authors.get(work) ?? authors.get(sha)
    if (!author) continue
    const commit: ModuleCommit = { commit: sha, date: new Date(date).toISOString(), author: credit(author), subject: author.subject }
    const bump = parseVersionBump(author.subject)

    const touched = new Set(files.map(file => file.trim() && moduleOf(file.trim())).filter((dir): dir is string => !!dir))
    for (const dir of touched) {
      let entry = result.get(dir)
      if (!entry) result.set(dir, entry = { lastChange: commit, history: [] })
      if (bump && bump.module === basename(dir) && entry.history.length < HISTORY) {
        const { subject: _, ...landed } = commit
        entry.history.push({ ...landed, version: bump.version })
      }
    }
  }
  return result
}

const readHistory = (repo: RepositoryCopy, modulePaths: string[]) => {
  if (!existsSync(join(repo.dir, '.git'))) return new Map<string, ModuleHistory>()
  const authorLog = git(repo.dir, ['log', `--format=${AUTHOR_FORMAT}`, 'HEAD'])
  const landedLog = git(repo.dir, ['log', '--first-parent', '--diff-merges=first-parent', '--name-only', `--format=${LANDED_FORMAT}`, 'HEAD'])
  return parseHistory(authorLog, landedLog, modulePaths)
}

const readRepository = (repo: RepositoryCopy): MoonbaseRepository => {
  if (!existsSync(join(repo.dir, '.git'))) return { name: repo.name, commit: '', date: '' }
  const [commit = '', date = ''] = git(repo.dir, ['log', '-1', '--format=%H%x1f%cI', 'HEAD']).trim().split('\x1f')
  return { name: repo.name, commit, date: date && new Date(date).toISOString() }
}

// ---------------------------------------------------------------------------------------------
// The index
// ---------------------------------------------------------------------------------------------

export type BuildResult = { index: MoonbaseIndex, warnings: string[] }

export const buildMoonbaseIndex = (repos: RepositoryCopy[], now = new Date()): BuildResult => {
  const warnings: string[] = []

  // Aliases: every repository may add providers; earlier repositories' come first
  const aliases: Record<string, string[]> = {}
  for (const repo of repos) {
    const text = read(repo.dir, 'aliases')
    if (!text) continue
    for (const [alias, providers] of Object.entries(parseAliases(text))) {
      const list = (aliases[alias] ??= [])
      for (const provider of providers) if (!list.includes(provider)) list.push(provider)
    }
  }

  // One module per name: a crater copy gives way to an active one, otherwise the first repository wins
  const isCrater = (path: string) => path.split('/').includes('crater')
  const byName = new Map<string, Found>()
  for (const repo of repos) {
    for (const found of findModules(repo)) {
      const existing = byName.get(found.name)
      if (!existing) byName.set(found.name, found)
      else {
        const keep = isCrater(existing.path) && !isCrater(found.path) ? found : existing
        const drop = keep === found ? existing : found
        byName.set(found.name, keep)
        warnings.push(`${found.name}: in ${keep.repo}/${keep.path} and ${drop.repo}/${drop.path}, using ${keep.repo}/${keep.path}`)
      }
    }
  }

  // DETAILS, read on demand so `$(module_version other)` can look up another module
  const details = new Map<string, Details | null>()
  const detailsOf = (name: string): Details | null => {
    if (details.has(name)) return details.get(name)!
    details.set(name, null) // guards against a cycle
    const found = byName.get(name)
    const text = found && (read(found.dir, 'DETAILS.x86_64') ?? read(found.dir, 'DETAILS'))
    const result = text
      ? parseDetails(text, {
          env: new Map(Object.entries({ ...LUNAR_URLS, MODULE: name })),
          moduleVersion: other => detailsOf(other)?.env.get('VERSION') ?? null
        })
      : null
    details.set(name, result)
    return result
  }

  const histories = new Map<string, ModuleHistory>()
  for (const repo of repos) {
    const paths = [...byName.values()].filter(found => found.repo === repo.name).map(found => found.path)
    try {
      for (const [path, history] of readHistory(repo, paths)) histories.set(`${repo.name}/${path}`, history)
    } catch (error) {
      warnings.push(`${repo.name}: no history (${(error as Error).message.split('\n')[0]})`)
    }
  }

  const modules: MoonbaseModule[] = []
  const rawDepends = new Map<string, RawDependency[]>()

  for (const found of [...byName.values()].sort((a, b) => a.name.localeCompare(b.name))) {
    const info = detailsOf(found.name)
    const env = info?.env ?? new Map<string, string>()
    const value = (name: string) => (info && !info.unresolved.has(name) && env.get(name)) || null
    if (info?.unresolved.has('VERSION')) warnings.push(`${found.name}: VERSION can't be worked out without running DETAILS`)

    const sourceFull = value('SOURCE_URL_FULL')
    const sourceUrl = value('SOURCE_URL')
    const sourceFile = value('SOURCE')
    const source = sourceFull ?? (sourceUrl && sourceFile ? `${sourceUrl.replace(/\/+$/, '')}/${sourceFile}` : null)

    const segments = found.path.split('/')
    const short = found.repo.replace(/^moonbase-/, '')
    const dependsText = read(found.dir, 'DEPENDS')
    const configureText = read(found.dir, 'CONFIGURE')
    const history = histories.get(`${found.repo}/${found.path}`)
    rawDepends.set(found.name, dependsText ? parseDepends(dependsText, { env }) : [])

    const patches = count(join(found.dir, 'patch.d'))
    modules.push({
      name: found.name,
      version: value('VERSION'),
      repo: short,
      path: found.path,
      section: segments.length > 1 ? segments[0]! : short,
      short: value('SHORT'),
      description: info?.description ?? null,
      website: value('WEB_SITE'),
      source,
      entered: isoDay(value('ENTERED') ?? undefined),
      updated: isoDay(value('UPDATED') ?? undefined),
      ...(segments.includes('crater') ? { crater: true as const } : {}),
      ...(segments.includes('zbeta') ? { beta: true as const } : {}),
      depends: [],
      dependents: [],
      bringsAlong: 0,
      questions: configureText ? parseConfigure(configureText, { env }) : [],
      ...(existsSync(join(found.dir, 'systemd.d')) ? { systemd: true as const } : {}),
      ...(patches ? { patches } : {}),
      ...(existsSync(join(found.dir, 'plugin.d')) ? { plugin: true as const } : {}),
      lastChange: history?.lastChange ?? null,
      history: history?.history ?? []
    })
  }

  const byModule = new Map(modules.map(module => [module.name, module]))

  // Dependencies, with unknown names marked; one entry per dependency, a required one wins
  for (const module of modules) {
    const seen = new Map<string, ModuleDependency>()
    for (const raw of rawDepends.get(module.name) ?? []) {
      if (raw.module === module.name) continue
      const known = raw.module.startsWith('%') ? !!aliases[raw.module]?.length : byModule.has(raw.module)
      const dependency: ModuleDependency = { ...raw, ...(known ? {} : { missing: true as const }) }
      const previous = seen.get(raw.module)
      if (!previous || (previous.optional && !raw.optional)) seen.set(raw.module, dependency)
    }
    module.depends = [...seen.values()]
  }

  // Dependents: who depends on each module, directly or through an alias it provides
  const dependents = new Map<string, Map<string, ModuleDependent>>()
  const addDependent = (target: string, dependent: ModuleDependent) => {
    if (!byModule.has(target) || target === dependent.module) return
    const list = dependents.get(target) ?? new Map<string, ModuleDependent>()
    dependents.set(target, list)
    const previous = list.get(dependent.module)
    if (!previous || (previous.optional && !dependent.optional)) list.set(dependent.module, dependent)
  }
  for (const module of modules) {
    for (const dependency of module.depends) {
      if (dependency.missing) continue
      const optional = dependency.optional ? { optional: true as const } : {}
      if (dependency.module.startsWith('%')) {
        for (const provider of aliases[dependency.module]!) addDependent(provider, { module: module.name, ...optional, via: dependency.module })
      } else {
        addDependent(dependency.module, { module: module.name, ...optional })
      }
    }
  }
  for (const module of modules) {
    module.dependents = [...(dependents.get(module.name)?.values() ?? [])].sort((a, b) => a.module.localeCompare(b.module))
  }

  // Brings along: required, unconditional dependencies, recursively; an alias resolves to its first provider
  const required = (name: string) =>
    (byModule.get(name)?.depends ?? [])
      .filter(dependency => !dependency.optional && !dependency.conditional && !dependency.missing)
      .map(dependency => (dependency.module.startsWith('%') ? aliases[dependency.module]![0]! : dependency.module))
      .filter(dependency => byModule.has(dependency))
  for (const module of modules) {
    const seen = new Set<string>([module.name])
    const queue = [...required(module.name)]
    while (queue.length) {
      const next = queue.pop()!
      if (seen.has(next)) continue
      seen.add(next)
      queue.push(...required(next))
    }
    module.bringsAlong = seen.size - 1
  }

  return {
    index: {
      version: 1,
      generatedAt: now.toISOString(),
      repositories: repos.map(readRepository),
      aliases,
      modules
    },
    warnings
  }
}
