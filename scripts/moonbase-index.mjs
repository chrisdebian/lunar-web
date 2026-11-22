#!/usr/bin/env node
// Builds the moonbase module index (every module, its dependencies, dependents and recent history)
// from the moonbase repositories on GitHub, for the /modules pages.
//
//   yarn moonbase:index [output.json]      (default: .data/moonbase-index.json)
//   yarn moonbase:index --compare URL      prints "unchanged" if the index published at URL was
//                                          built from the repositories' current commits, else
//                                          "changed: <repositories>" (the hourly Pages check)
//
// The site only reads the file (MOONBASE_INDEX, see server/utils/moonbaseIndex.ts), so this is
// optional for development: without it the site uses the published copy.
//
// The first run clones the 8 repositories with their full history (about 110 MB, under a minute)
// into MOONBASE_CACHE (default .cache/moonbase); later runs only fetch new commits. Node runs the
// TypeScript modules below directly (type stripping), so no install is needed.

import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import process from 'node:process'
import { MOONBASE_OWNER, MOONBASE_REPOSITORIES } from '../server/utils/moonbase.ts'
import { buildMoonbaseIndex } from './lib/moonbase-index.ts'

const BRANCH = 'master'
const remote = name => `https://github.com/${MOONBASE_OWNER}/${name}.git`

if (process.argv[2] === '--compare') {
  const url = process.argv[3]
  const published = new Map()
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(30_000) })
    if (response.ok) for (const repo of (await response.json()).repositories ?? []) published.set(repo.name, repo.commit)
  } catch (error) {
    console.error(`No published index at ${url}: ${error.message}`)
  }
  const changed = MOONBASE_REPOSITORIES.filter((name) => {
    const head = execFileSync('git', ['ls-remote', remote(name), `refs/heads/${BRANCH}`], { encoding: 'utf8' }).split('\t')[0]
    return !head || head !== published.get(name)
  })
  console.log(changed.length ? `changed: ${changed.join(' ')}` : 'unchanged')
  process.exit(0)
}

const output = resolve(process.argv[2] ?? '.data/moonbase-index.json')
const cache = resolve(process.env.MOONBASE_CACHE ?? '.cache/moonbase')

const git = (args, cwd) => execFileSync('git', args, { cwd, stdio: ['ignore', 'ignore', 'inherit'] })

const started = Date.now()
mkdirSync(cache, { recursive: true })
const repos = MOONBASE_REPOSITORIES.map((name) => {
  const dir = join(cache, name)
  if (existsSync(join(dir, '.git'))) {
    git(['fetch', '--quiet', '--no-tags', 'origin', BRANCH], dir)
    git(['reset', '--quiet', '--hard', 'FETCH_HEAD'], dir)
  } else {
    git(['clone', '--quiet', '--no-tags', '--single-branch', '--branch', BRANCH, remote(name), dir])
  }
  return { name, dir }
})
const fetched = Date.now()

const { index, warnings } = buildMoonbaseIndex(repos)
for (const warning of warnings) console.warn(`  ${warning}`)

mkdirSync(dirname(output), { recursive: true })
const json = JSON.stringify(index)
writeFileSync(output, json)
const seconds = ms => `${(ms / 1000).toFixed(1)} s`
console.log(
  `${index.modules.length} modules from ${repos.length} repositories → ${output} `
  + `(${(json.length / 1e6).toFixed(1)} MB; fetch ${seconds(fetched - started)}, index ${seconds(Date.now() - fetched)})`
)
