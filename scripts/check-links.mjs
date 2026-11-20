#!/usr/bin/env node
// Checks every link in the generated static site (.output/public).
//
//   yarn generate && yarn check-links            internal links + #anchors (fails on errors)
//   yarn check-links --external                  also request every external URL (reported as warnings)
//   NUXT_APP_BASE_URL=/lunar-www/ yarn check-links   check a build made for a sub-path
//
// Internal links must resolve to a generated file, stay inside the base URL, and any #anchor must
// exist on the target page. `href="#"` placeholders are reported as warnings.

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import process from 'node:process'

const args = process.argv.slice(2)
const option = (name, fallback) => {
  const index = args.indexOf(name)
  return index === -1 ? fallback : args[index + 1]
}

const outputDir = option('--dir', '.output/public')
const checkExternal = args.includes('--external')
const base = `/${(option('--base', process.env.NUXT_APP_BASE_URL || '/')).replace(/^\/+|\/+$/g, '')}/`.replace('//', '/')
// Absolute links to the site itself (canonical, og:url) are checked as internal links.
const siteUrl = option('--site-url', process.env.NUXT_PUBLIC_SITE_URL || 'https://lunar-linux.org/').replace(/\/?$/, '/')

if (!existsSync(outputDir)) {
  console.error(`✖ ${outputDir} does not exist. Run \`yarn generate\` first.`)
  process.exit(1)
}

const walk = dir => readdirSync(dir).flatMap((name) => {
  const full = join(dir, name)
  return statSync(full).isDirectory() ? walk(full) : [full]
})

const decode = value => value
  .replace(/&amp;/g, '&')
  .replace(/&quot;/g, '"')
  .replace(/&#x27;|&#39;/g, '\'')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')

const htmlFiles = walk(outputDir).filter(file => file.endsWith('.html'))
const idCache = new Map()
const idsOf = (file) => {
  if (!idCache.has(file)) {
    const html = readFileSync(file, 'utf8')
    idCache.set(file, new Set([...html.matchAll(/\sid="([^"]+)"/g)].map(match => decode(match[1]))))
  }
  return idCache.get(file)
}

/** URL path (including base) that serves a generated file. */
const urlPathOf = (file) => {
  const rel = relative(outputDir, file).split(sep).join('/')
  return base + rel.replace(/(^|\/)index\.html$/, '$1')
}

/** Generated file that a URL pathname (including base) resolves to, as a static host would serve it. */
const fileFor = (pathname) => {
  if (!pathname.startsWith(base) && `${pathname}/` !== base) return null
  const rel = decodeURIComponent(pathname.slice(base.length)).replace(/\/$/, '')
  const candidates = rel === ''
    ? ['index.html']
    : [rel, `${rel}/index.html`, `${rel}.html`]
  for (const candidate of candidates) {
    const full = join(outputDir, candidate)
    if (existsSync(full) && statSync(full).isFile()) return full
  }
  return null
}

// Generated pages that are not real content.
const skipPages = new Set(['200.html', '404.html'])

const errors = []
const placeholders = new Map()
const external = new Map() // url -> Set<page>

for (const file of htmlFiles) {
  const rel = relative(outputDir, file).split(sep).join('/')
  if (skipPages.has(rel)) continue

  const pageUrl = urlPathOf(file)
  const html = readFileSync(file, 'utf8')

  for (const [, rawAttr, rawValue] of html.matchAll(/\s(href|src)="([^"]*)"/g)) {
    const value = decode(rawValue).trim()
    if (!value || /^(mailto|tel|javascript|data|irc|ircs):/i.test(value)) continue

    if (value === '#') {
      placeholders.set(pageUrl, (placeholders.get(pageUrl) ?? 0) + 1)
      continue
    }

    if (value.startsWith(siteUrl) || `${value}/` === siteUrl) {
      const path = value.slice(siteUrl.length)
      const url = new URL(base + path, 'http://site.local')
      if (!fileFor(url.pathname)) errors.push(`${pageUrl}: ${rawAttr}="${value}" → ${url.pathname} not found`)
      continue
    }

    if (/^https?:\/\//i.test(value) || value.startsWith('//')) {
      const url = value.startsWith('//') ? `https:${value}` : value
      if (!external.has(url)) external.set(url, new Set())
      external.get(url).add(pageUrl)
      continue
    }

    const url = new URL(value, `http://site.local${pageUrl}`)
    const target = fileFor(url.pathname)
    if (!target) {
      errors.push(`${pageUrl}: ${rawAttr}="${value}" → ${url.pathname} not found${url.pathname.startsWith(base) ? '' : ` (outside base ${base})`}`)
      continue
    }

    if (url.hash.length > 1 && target.endsWith('.html')) {
      const id = decodeURIComponent(url.hash.slice(1))
      if (!idsOf(target).has(id)) errors.push(`${pageUrl}: ${rawAttr}="${value}" → no element with id="${id}" on ${url.pathname}`)
    }
  }
}

console.log(`Checked ${htmlFiles.length - skipPages.size} pages in ${outputDir} (base ${base}).`)

if (placeholders.size) {
  const total = [...placeholders.values()].reduce((sum, count) => sum + count, 0)
  console.warn(`⚠ ${total} placeholder links (href="#") on ${placeholders.size} pages: ${[...placeholders.keys()].slice(0, 5).join(', ')}${placeholders.size > 5 ? ', …' : ''}`)
}

if (checkExternal) {
  const urls = [...external.keys()]
  console.log(`Checking ${urls.length} external URLs…`)
  const problems = []
  const check = async (url) => {
    const request = method => fetch(url, {
      method,
      redirect: 'follow',
      signal: AbortSignal.timeout(15_000),
      headers: { 'user-agent': 'lunar-www-link-checker' }
    })
    try {
      let response = await request('HEAD')
      if (response.status >= 400) response = await request('GET')
      if (response.status >= 400) problems.push(`${response.status} ${url}`)
    } catch (error) {
      problems.push(`${error.cause?.code ?? error.name} ${url}`)
    }
  }
  for (let i = 0; i < urls.length; i += 8) await Promise.all(urls.slice(i, i + 8).map(check))
  for (const problem of problems.sort()) {
    const url = problem.slice(problem.indexOf(' ') + 1)
    console.warn(`⚠ external ${problem}  (on ${[...external.get(url)].join(', ')})`)
  }
  if (!problems.length) console.log('✔ All external URLs responded.')
}

if (errors.length) {
  for (const error of errors) console.error(`✖ ${error}`)
  console.error(`\n${errors.length} broken internal link(s).`)
  process.exit(1)
}

console.log('✔ No broken internal links.')
