# Contributing

Thanks for helping improve the Lunar Linux website. Questions are welcome in `#lunar` on
[Libera.Chat](https://web.libera.chat/#lunar).

## Workflow

1. Fork the repository and create a branch.
2. Make your changes. Run `yarn dev` to preview them.
3. Run `yarn verify` (lint, typecheck, unit tests, content check, build and link check). CI runs the same checks.
4. Open a pull request.

By contributing you agree that code is licensed under [MIT](LICENSE) and documentation/news under
[CC BY-SA 4.0](LICENSE-CONTENT.md).

## Writing documentation

Pages live in `content/docs/`. The URL follows the file path: `content/docs/installation/requirements.md`
becomes `/docs/installation/requirements`, and a directory's `index.md` is that section's landing page.
The sidebar is built from this structure automatically.

Frontmatter (validated by `content.config.ts` and `yarn check-content`):

```yaml
---
title: "System Requirements"          # required
description: "One sentence summary"   # required
category: "installation"
order: 2                              # position in the sidebar; pages without it sort by title after ordered ones
tags: [installation, hardware]        # used to suggest related articles
lastUpdated: 2026-11-20
archived: true                        # optional: shows an "Archived" banner
seeAlso:                              # optional
  - title: "Installation Guide"
    path: "/docs/installation/installation-guide"
---
```

Guidelines:

- Link to other pages with absolute paths (`/docs/faq`, `/docs/faq#optimizations`). Relative links
  (`../faq`) are rejected by `yarn check-content`.
- Start sections at `##`; the page title is rendered from `title`. `##` and `###` headings appear in
  the table of contents and in search results.
- Give code blocks a language (`bash`, `ini`, …). Every code block gets a copy button.
- Don't link to placeholder destinations. If something has no real home yet, leave it as text.

## News

Articles live in `content/news/` and need `title`, `description` and `date` (`YYYY-MM-DD`). They appear
on the homepage, at `/news` and in the RSS feed (`/rss.xml`).

## Migrating pages from the old wiki

Raw imports from the old wiki are kept out of the site until they've been reviewed.

1. **Import:** `node scripts/wiki-scraper.mjs` writes converted pages to `docs-imported-staging/`
   (git-ignored), each flagged `needsReview: true`.
2. **Categorize:** pick a section (`installation`, `package-management`, `system-administration`,
   `development`, `guides`, `community`) and move the file into `content/docs/`.
3. **Refine:** complete the frontmatter above, fix headings (`##` → `###` → `####`), add languages to
   code blocks, update outdated information (for example the IRC network, now Libera.Chat), and mark
   historical material with `archived: true`.
4. **Verify:** remove `needsReview`, run `yarn verify` and check the page in `yarn dev`.

## Code conventions

- Vue 3 Composition API with `<script setup lang="ts">`; components auto-import by file name.
- `type` over `interface`, const objects over `enum`.
- Tailwind utility classes; global styles and theme tokens live in `app/assets/css/main.css`.
- Use `<NuxtLink>` for internal links. For files the router doesn't know (`/rss.xml`), use
  `useSiteLinks().withBase()` so the link works when the site is served from a sub-path.
- Set page metadata with `usePageSeo()`.
