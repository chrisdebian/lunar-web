/*
 * The moonbase module index: every module in the moonbase repositories with its details,
 * dependencies, dependents and recent history. Built by `yarn moonbase:index`
 * (scripts/moonbase-index.mjs), read by the site (server/utils/moonbaseIndex.ts) and published
 * as /modules/index.json. No imports, and only TypeScript Node can strip (the script imports it).
 */

export const MOONBASE_INDEX_VERSION = 1

/** A dependency as written in a module's DEPENDS file. */
export type ModuleDependency = {
  /** Module name, or an alias such as `%SSL` that several modules can provide */
  module: string
  /** `optional_depends`: lin asks about it. Absent for a required `depends`. */
  optional?: {
    /** Lin's own description: "for call-chain library support" */
    description: string
    /** The answer lin suggests, or null when DEPENDS gives none (then yes if installed, else no) */
    default: boolean | null
  }
  /** Inside an `if` or `case` in DEPENDS: only applies in some situations */
  conditional?: true
  /** Not a module in the moonbase, nor an alias */
  missing?: true
}

/** A module that depends on this one. */
export type ModuleDependent = {
  module: string
  optional?: true
  /** Through an alias it provides, e.g. `%SSL` */
  via?: string
}

/** A question from the module's CONFIGURE file (`mquery`). */
export type ModuleQuestion = {
  question: string
  /** The suggested answer, or null if CONFIGURE gives none */
  default: boolean | null
}

/** One commit, credited to the person behind it (a bot's co-author, the PR author for a merge). */
export type ModuleCommit = {
  commit: string
  /** ISO date when it landed on master */
  date: string
  author: string
  subject: string
}

/** A version bump: the commit without its subject, which only repeats the version */
export type ModuleVersionChange = Omit<ModuleCommit, 'subject'> & { version: string }

export type MoonbaseModule = {
  name: string
  /** null if DETAILS computes it in a way we can't follow */
  version: string | null
  /** Repository without the `moonbase-` prefix: core, other, xorg, … */
  repo: string
  /** The module's folder in the repository, e.g. `compilers/llvm-stack/clang` */
  path: string
  /** The top-level section, the same across repositories: `libs`, `devel`, `crater`, … */
  section: string
  short: string | null
  /** The long description from DETAILS */
  description: string | null
  website: string | null
  /** Where the (first) source comes from */
  source: string | null
  /** YYYY-MM-DD, from DETAILS ENTERED: when the module joined the moonbase */
  entered: string | null
  /** YYYY-MM-DD, from DETAILS UPDATED */
  updated: string | null
  /** In a `crater` section: upstream stopped developing it, but it's still in the moonbase */
  crater?: true
  /** In `zbeta` */
  beta?: true
  depends: ModuleDependency[]
  dependents: ModuleDependent[]
  /** Distinct modules a bare system would build first: all required dependencies, recursively */
  bringsAlong: number
  questions: ModuleQuestion[]
  /** Ships systemd units (systemd.d) */
  systemd?: true
  /** Number of patches in patch.d */
  patches?: number
  /** Installs a lunar plugin (plugin.d) */
  plugin?: true
  /** The latest commit that touched the module */
  lastChange: ModuleCommit | null
  /** Recent version bumps, newest first */
  history: ModuleVersionChange[]
}

export type MoonbaseRepository = {
  /** Full name: moonbase-core */
  name: string
  /** Commit the index was built from */
  commit: string
  /** ISO date of that commit */
  date: string
}

/* ---- Views of the index for the /modules pages (server/utils/moonbaseViews.ts) ---- */

/** Enough to list a module: the search file, section pages, a module's neighbours. */
export type ModuleSummary = {
  name: string
  version: string | null
  section: string
  short: string | null
  crater?: true
  beta?: true
}

export type ModuleSection = {
  name: string
  count: number
  /** The section's most depended-on modules, as a taste of what's in it */
  highlights: string[]
}

export type MoonbaseOverview = {
  generatedAt: string | null
  total: number
  sections: ModuleSection[]
}

export type ModuleSectionPage = {
  section: string
  modules: ModuleSummary[]
}

export type ModulePage = {
  /** When the index was built */
  generatedAt: string | null
  module: MoonbaseModule
  /** Every module this page mentions (dependencies, dependents, providers), by name */
  related: Record<string, ModuleSummary>
  /** Providers of the aliases this module depends on */
  aliases: Record<string, string[]>
}

export type MoonbaseIndex = {
  version: typeof MOONBASE_INDEX_VERSION
  /** ISO date, or null for the empty index used when no data is available */
  generatedAt: string | null
  repositories: MoonbaseRepository[]
  /** `%SSL` → ['openssl', 'libressl', …]; the first is what lin proposes */
  aliases: Record<string, string[]>
  modules: MoonbaseModule[]
}
