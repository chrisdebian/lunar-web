/**
 * The moonbase arrivals board's data (see server/utils/moonbase.ts), prerendered at build time.
 * On GitHub Pages the moonbase-feed workflow later replaces the published file with fresh data,
 * and the board picks that up in the browser.
 *
 * If GitHub can't be reached the list is empty, the board is left out and the build carries on.
 * Set GITHUB_TOKEN (CI does) to avoid GitHub's limit of 60 unauthenticated requests an hour.
 */

/** Cached for an hour (handy in dev); a failure throws, so it isn't cached. */
const cachedArrivals = defineCachedFunction(
  () => fetchMoonbaseArrivals(process.env.GITHUB_TOKEN),
  { maxAge: 60 * 60, name: 'moonbase-arrivals' }
)

export default defineEventHandler(async (): Promise<MoonbaseArrivals> => {
  try {
    return await cachedArrivals()
  } catch (error) {
    console.warn(`[moonbase-arrivals] GitHub unavailable, leaving the board out: ${(error as Error).message}`)
    return { arrivals: [], total: 0, days: 30, generatedAt: new Date().toISOString() }
  }
})
