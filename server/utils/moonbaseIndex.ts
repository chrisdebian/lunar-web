/*
 * The moonbase module index for the /modules pages (shared/types/moonbase-index.ts).
 *
 * The site never builds the index itself (that's `yarn moonbase:index`); it reads it from, in order:
 * 1. the file in MOONBASE_INDEX (default .data/moonbase-index.json), if it exists
 * 2. the published copy at MOONBASE_INDEX_URL (default: the live site's /modules/index.json)
 * 3. an empty index: the modules pages say so, and the build carries on.
 */

import { readFile, stat } from 'node:fs/promises'
import { MOONBASE_INDEX_VERSION, type MoonbaseIndex } from '#shared/types/moonbase-index'

const DEFAULT_FILE = '.data/moonbase-index.json'
// Where production publishes it. Switch to https://lunar-linux.org/ at the relaunch (RELAUNCH.md).
const DEFAULT_URL = 'https://demo.lunar-linux.org/modules/index.json'

export const emptyMoonbaseIndex = (): MoonbaseIndex => ({
  version: MOONBASE_INDEX_VERSION,
  generatedAt: null,
  repositories: [],
  aliases: {},
  modules: []
})

const isIndex = (value: unknown): value is MoonbaseIndex =>
  !!value && typeof value === 'object'
  && (value as MoonbaseIndex).version === MOONBASE_INDEX_VERSION
  && Array.isArray((value as MoonbaseIndex).modules)

const fromFile = async (path: string) => {
  const index: unknown = JSON.parse(await readFile(path, 'utf8'))
  if (!isIndex(index)) throw new Error(`${path} is not a version ${MOONBASE_INDEX_VERSION} moonbase index`)
  return index
}

const fromUrl = async (url: string) => {
  const response = await fetch(url, { signal: AbortSignal.timeout(30_000) })
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`)
  const index: unknown = await response.json()
  if (!isIndex(index)) throw new Error(`${url} is not a version ${MOONBASE_INDEX_VERSION} moonbase index`)
  return index
}

let loaded: { key: string, index: Promise<MoonbaseIndex> } | undefined

/** The index, loaded once (again if the file changes, so `yarn moonbase:index` shows up in dev). */
export const loadMoonbaseIndex = async (): Promise<MoonbaseIndex> => {
  const file = process.env.MOONBASE_INDEX || DEFAULT_FILE
  const url = process.env.MOONBASE_INDEX_URL || DEFAULT_URL
  const modified = await stat(file).then(info => info.mtimeMs, () => null)
  const key = modified === null ? `url:${url}` : `file:${file}:${modified}`
  if (loaded?.key !== key) {
    loaded = {
      key,
      index: (async () => {
        try {
          if (modified !== null) return await fromFile(file)
          console.info(`[moonbase-index] ${file} not found, using the published copy at ${url}`)
          return await fromUrl(url)
        } catch (error) {
          console.warn(`[moonbase-index] no module index, the modules pages will be empty: ${(error as Error).message}`)
          return emptyMoonbaseIndex()
        }
      })()
    }
  }
  return loaded.index
}
