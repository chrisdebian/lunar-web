import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// docker/legacy-redirects.conf sends the old WordPress news URLs to their pages in /news.
// Renaming or removing a news file would quietly turn its redirect into a 404, so check them all.
const conf = readFileSync('docker/legacy-redirects.conf', 'utf8')
const rules = [...conf.matchAll(/^location \^~ (\/\d{4}\/\d{2}\/\d{2}\/\S+)\s+\{ return 301 (\S+); \}$/gm)]
  .map(([, from, to]) => [from!, to!] as const)

describe('legacy redirects', () => {
  it('has a redirect for every imported WordPress post, and nothing else', () => {
    expect(rules.length).toBe(56)
    expect(conf.match(/^\s*(location|if|rewrite|return)\b/gm)?.length).toBe(56)
  })

  it.each(rules)('%s → %s exists', (_, to) => {
    expect(to).toMatch(/^\/news\/\d{4}-\d{2}-\d{2}-/)
    expect(existsSync(`content${to}.md`)).toBe(true)
  })
})
