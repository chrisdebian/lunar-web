import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'

const script = join(import.meta.dirname, '../scripts/check-links.mjs')
const sites: string[] = []

/** Writes a tiny generated site ({ 'docs/index.html': '<html>' }) to a temporary folder. */
const site = (files: Record<string, string>) => {
  const dir = mkdtempSync(join(tmpdir(), 'check-links-'))
  sites.push(dir)
  for (const [path, html] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, path)), { recursive: true })
    writeFileSync(join(dir, path), html)
  }
  return dir
}

const checkLinks = (dir: string, ...args: string[]) => {
  const result = spawnSync(process.execPath, [script, '--dir', dir, ...args], {
    encoding: 'utf8',
    env: { ...process.env, NUXT_APP_BASE_URL: '', NUXT_PUBLIC_SITE_URL: '' }
  })
  return { status: result.status, output: result.stdout + result.stderr }
}

afterEach(() => {
  for (const dir of sites.splice(0)) rmSync(dir, { recursive: true, force: true })
})

describe('check-links', () => {
  it('passes a site whose links and anchors all resolve', () => {
    const dir = site({
      'index.html': '<a href="/docs">Docs</a> <a href="/docs/faq#kernel">FAQ</a> <a href="/news.html">News</a>',
      'docs/index.html': '<a href="faq">relative</a>',
      'docs/faq/index.html': '<h2 id="kernel">Kernel</h2>',
      'news.html': '<a href="/">Home</a>'
    })
    const { status, output } = checkLinks(dir)
    expect(status).toBe(0)
    expect(output).toContain('No broken internal links')
  })

  it('fails on a link to a missing page', () => {
    const dir = site({ 'index.html': '<a href="/missing">Gone</a>' })
    const { status, output } = checkLinks(dir)
    expect(status).toBe(1)
    expect(output).toContain('/missing not found')
  })

  it('fails on a missing #anchor', () => {
    const dir = site({
      'index.html': '<a href="/faq#nope">FAQ</a>',
      'faq/index.html': '<h2 id="kernel">Kernel</h2>'
    })
    const { status, output } = checkLinks(dir)
    expect(status).toBe(1)
    expect(output).toContain('no element with id="nope"')
  })

  it('reports href="#" placeholders as warnings only', () => {
    const dir = site({ 'index.html': '<a href="#">Soon</a>' })
    const { status, output } = checkLinks(dir)
    expect(status).toBe(0)
    expect(output).toContain('1 placeholder links')
  })

  it('checks a build for a sub-path and rejects links outside it', () => {
    const dir = site({ 'index.html': '<a href="/lunar/docs">Docs</a> <a href="/elsewhere">Out</a>', 'docs/index.html': '' })
    const { status, output } = checkLinks(dir, '--base', '/lunar/')
    expect(status).toBe(1)
    expect(output).toContain('outside base /lunar/')
    expect(output).not.toContain('/lunar/docs not found')
  })

  it('treats absolute links to the site itself as internal', () => {
    const dir = site({ 'index.html': '<link rel="canonical" href="https://example.org/lunar/gone">' })
    const { status, output } = checkLinks(dir, '--base', '/lunar/', '--site-url', 'https://example.org/lunar/')
    expect(status).toBe(1)
    expect(output).toContain('/lunar/gone not found')
  })

  it('writes no report when only internal links are checked', () => {
    const dir = site({ 'index.html': '<a href="https://example.org/">Out</a>' })
    const report = join(dir, 'report.md')
    checkLinks(dir, '--report', report)
    expect(() => readFileSync(report)).toThrow()
  })
})
