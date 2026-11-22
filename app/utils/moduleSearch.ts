import type { ModuleSummary } from '#shared/types/moonbase-index'

/** A module's rank for a search: higher is better, null if it doesn't match. */
const score = (module: ModuleSummary, query: string, terms: string[]) => {
  const name = module.name.toLowerCase()
  let points: number
  if (name === query) points = 100
  else if (name.startsWith(query)) points = 80
  else if (name.includes(query)) points = 60
  else {
    // Every word somewhere in the name or description: "web browser", "pdf viewer"
    const text = `${name} ${(module.short ?? '').toLowerCase()}`
    if (!terms.every(term => text.includes(term))) return null
    points = 20 + terms.filter(term => name.includes(term)).length * 10
  }
  // Abandoned upstream or beta: still listed, below the rest
  if (module.crater || module.beta) points -= 30
  return points
}

/**
 * Modules matching `query`, best first: the exact name, then names starting with it, names
 * containing it, and modules whose name and description contain every word. Ties go to the
 * shorter name, then alphabetically.
 */
export const searchModules = (modules: ModuleSummary[], query: string) => {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return []
  const terms = normalized.split(/\s+/)
  return modules
    .map(module => ({ module, points: score(module, normalized, terms) }))
    .filter((entry): entry is { module: ModuleSummary, points: number } => entry.points !== null)
    .sort((a, b) =>
      b.points - a.points
      || a.module.name.length - b.module.name.length
      || a.module.name.localeCompare(b.module.name))
    .map(entry => entry.module)
}
