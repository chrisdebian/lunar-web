/*
 * The parts of the module index each /modules page needs, so no page carries the whole index:
 * an overview with the sections, one section's modules, one module with its neighbours, and the
 * slim list the search box loads (/modules/search.json).
 */

import type {
  ModulePage, ModuleSectionPage, ModuleSummary, MoonbaseIndex, MoonbaseModule, MoonbaseOverview
} from '#shared/types/moonbase-index'

const HIGHLIGHTS = 3

export const summarize = (module: MoonbaseModule): ModuleSummary => ({
  name: module.name,
  version: module.version,
  section: module.section,
  short: module.short,
  ...(module.crater ? { crater: true as const } : {}),
  ...(module.beta ? { beta: true as const } : {})
})

const views = new WeakMap<MoonbaseIndex, { byName: Map<string, MoonbaseModule>, bySection: Map<string, MoonbaseModule[]> }>()

/** Lookups for an index, built once per index. */
const lookups = (index: MoonbaseIndex) => {
  let view = views.get(index)
  if (!view) {
    const bySection = new Map<string, MoonbaseModule[]>()
    for (const module of index.modules) {
      const list = bySection.get(module.section) ?? []
      list.push(module)
      bySection.set(module.section, list)
    }
    view = { byName: new Map(index.modules.map(module => [module.name, module])), bySection }
    views.set(index, view)
  }
  return view
}

export const moonbaseOverview = (index: MoonbaseIndex): MoonbaseOverview => ({
  generatedAt: index.generatedAt,
  total: index.modules.length,
  sections: [...lookups(index).bySection]
    .map(([name, modules]) => ({
      name,
      count: modules.length,
      highlights: [...modules]
        .sort((a, b) => b.dependents.length - a.dependents.length || a.name.localeCompare(b.name))
        .slice(0, HIGHLIGHTS)
        .map(module => module.name)
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
})

export const moonbaseSection = (index: MoonbaseIndex, section: string): ModuleSectionPage | null => {
  const modules = lookups(index).bySection.get(section)
  return modules ? { section, modules: modules.map(summarize) } : null
}

export const moonbaseModulePage = (index: MoonbaseIndex, name: string): ModulePage | null => {
  const { byName } = lookups(index)
  const module = byName.get(name)
  if (!module) return null

  const aliases: Record<string, string[]> = {}
  const names = new Set<string>()
  for (const dependency of module.depends) {
    if (dependency.module.startsWith('%')) {
      // Only providers that are in the moonbase (an alias can still name a removed module)
      const providers = (index.aliases[dependency.module] ?? []).filter(provider => byName.has(provider))
      aliases[dependency.module] = providers
      providers.forEach(provider => names.add(provider))
    } else {
      names.add(dependency.module)
    }
  }
  for (const dependent of module.dependents) names.add(dependent.module)

  const related: Record<string, ModuleSummary> = {}
  for (const other of names) {
    const found = byName.get(other)
    if (found) related[other] = summarize(found)
  }
  return { generatedAt: index.generatedAt, module, related, aliases }
}

export const moonbaseSearchList = (index: MoonbaseIndex): ModuleSummary[] => index.modules.map(summarize)

/** Whether the index has this module (the arrivals board links to its page only then). */
export const moonbaseHasModule = (index: MoonbaseIndex, name: string) => lookups(index).byName.has(name)
