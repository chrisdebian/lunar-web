/** A module version update found in a moonbase commit message. */
export type VersionBump = { module: string, version: string }

/*
 * Moonbase commit subjects look like:
 *   "pkgconf: Bump to 3.0.11."            "linux: version bumped to 7.3.4"
 *   "grub2: Bump to 2.16 (#4368)"         "kmod: version bumped to 34.3 (retake …)"
 *   "foo: updated to 1.2", "foo: upgrade to v2.0"
 */
const BUMP = /^([\w.+-]+):\s*(?:version\s+)?(?:bump(?:ed)?|update[ds]?|upgrade[ds]?)\s+(?:version\s+)?(?:to\s+)?v?(\d[\w.+~-]*)/i

/** The module and new version from a commit subject, or null if it isn't a version update. */
export const parseVersionBump = (subject: string): VersionBump | null => {
  const match = subject.trim().match(BUMP)
  if (!match) return null
  const [, module, version] = match
  return { module: module!, version: version!.replace(/[.,;:]+$/, '') }
}

/** Subject of the commit a `Revert "…"` commit reverts, or null. */
export const revertedSubject = (subject: string) => subject.match(/^Revert "(.+)"$/)?.[1] ?? null
