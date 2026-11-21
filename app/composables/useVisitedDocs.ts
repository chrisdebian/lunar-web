const STORAGE_KEY = 'lunar:docs-visited'

/**
 * Docs pages this visitor has opened, so the flight plan on /docs can light up the stops they've
 * been to. Kept only in this browser (localStorage); empty on the server and until `load()` runs
 * on the client, so server and client render the same markup first.
 */
export const useVisitedDocs = () => {
  const visited = useState<string[]>('docs-visited', () => [])

  const load = () => {
    try {
      const stored: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
      visited.value = Array.isArray(stored) ? stored.filter(item => typeof item === 'string') : []
    } catch {
      // Storage blocked (private mode, disabled site data): nothing is remembered.
    }
  }

  const markVisited = (path: string) => {
    load()
    if (visited.value.includes(path)) return
    visited.value = [...visited.value, path]
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(visited.value))
    } catch {
      // See load()
    }
  }

  return { visited, load, markVisited }
}
