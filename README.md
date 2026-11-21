# Lunar Linux website

The website and documentation for [Lunar Linux](https://lunar-linux.org/), a source-based Linux
distribution. It is a fully static site built with [Nuxt 4](https://nuxt.com/),
[Nuxt Content](https://content.nuxt.com/) and [Tailwind CSS](https://tailwindcss.com/).

- News and documentation are Markdown files in [`content/`](content/)
- Every page is prerendered to plain HTML; the build output can be served by any static web server

## Requirements

- Node.js 24 LTS (22.22+ also works); the version is pinned in `.nvmrc` and `.tool-versions`
- Yarn 1 (`corepack enable` or `npm i -g yarn`)
- Or only Docker: see [Develop with Docker](#develop-with-docker)

## Develop locally

```bash
yarn install
yarn dev          # http://localhost:3000, with hot reload
```

### Develop with Docker

No Node or Yarn needed. Your checkout is mounted into a Node container, so edits reload just
the same:

```bash
docker compose up dev                     # http://localhost:3000, with hot reload
docker compose run --rm dev yarn verify   # any yarn command: lint, generate, check-links, …
```

The first start installs the dependencies (about half a minute); later starts are quick. They are
kept in Docker volumes, apart from any `node_modules` on your machine. Use another port with
`DEV_PORT=3001 docker compose up dev`; start from scratch with `docker compose down -v`.

## Build the static site

```bash
yarn generate     # → .output/public
yarn preview      # serve the build locally
```

The site can be served from a sub-path. Set the path and the public URL at build time:

```bash
NUXT_APP_BASE_URL=/lunar/ NUXT_PUBLIC_SITE_URL=https://example.org/lunar/ yarn generate
```

| Variable | Default | Purpose |
| --- | --- | --- |
| `NUXT_APP_BASE_URL` | `/` | Path the site is served from |
| `NUXT_PUBLIC_SITE_URL` | `https://lunar-linux.org/` | Public URL (with sub-path); used for RSS, sitemap and canonical links |
| `NUXT_PUBLIC_INDEXABLE` | `true` | `false` for previews: `robots.txt` disallows crawling and pages get `noindex` |
| `GITHUB_TOKEN` | (none) | Optional. The homepage's moonbase arrivals board reads recent module updates from GitHub at build time; a token avoids GitHub's limit of 60 requests an hour. Without network access the board is left out |

## Run with Docker

The image builds the static site and serves it with nginx.

```bash
docker compose up --build web  # http://localhost:8080
```

Or without Compose:

```bash
docker build -t lunar-www .
docker run --rm -p 8080:80 lunar-www
```

For a sub-path, pass the same variables as build arguments:

```bash
docker build -t lunar-www \
  --build-arg NUXT_APP_BASE_URL=/lunar/ \
  --build-arg NUXT_PUBLIC_SITE_URL=https://example.org/lunar/ .
```

## Checks

```bash
yarn lint             # ESLint (yarn lint:fix to auto-fix)
yarn typecheck        # vue-tsc
yarn test             # unit tests (Vitest): moon phases, dates, docs tree, link checker
yarn check-content    # frontmatter + internal links in content/
yarn generate
yarn check-links      # every link and #anchor in the built site (add --external for outside URLs)
yarn verify           # all of the above
```

The build itself also fails if any page links to a page that doesn't exist.
`href="#"` placeholders are reported as warnings by `check-links`.

## Continuous integration and previews

- `.github/workflows/ci.yml` runs on every push and pull request: lint, typecheck, unit tests,
  content check, root and sub-path builds with link checks, `actionlint` on the workflows, and a
  Docker build with smoke tests.
- `.github/workflows/external-links.yml` checks every link to another website each Monday. Broken
  ones are listed in a "Broken external links" issue that is updated on later runs and closed when
  they all work again. Run it any time from the Actions tab.
- `.github/workflows/pages.yml` publishes `main` to the root of the GitHub Pages site on every push,
  e.g. `https://<owner>.github.io/<repo>/`.
- `.github/workflows/pr-preview.yml` publishes every pull request to
  `https://<owner>.github.io/<repo>/pr-preview/pr-<number>/`. Once the preview is live, it comments
  the link (and a QR code, handy for testing on a phone) on the PR and adds a *View deployment*
  button. It updates on every push and is removed when the PR is closed or merged. PRs from forks
  get no preview: GitHub gives them a read-only token.

Both build with `.github/actions/build-site` and push to the `gh-pages` branch. Everything published
there is marked `noindex`.

One-time setup, after the first push to `main` has created the `gh-pages` branch:
*Settings → Pages → Build and deployment → Source: Deploy from a branch*, branch `gh-pages`, folder
`/ (root)`. If the organization limits workflow permissions, allow *Read and write permissions* under
*Settings → Actions → General*.

Actions are pinned to full commit SHAs, with the version in a comment. Dependabot
(`.github/dependabot.yml`) opens one grouped PR a week when any of them has a new release. Its PRs
run CI but get no preview, like PRs from forks.

## Project layout

```text
app/                  Nuxt application (pages, components, composables, layouts, styles)
content/docs/         Documentation pages (Markdown)
content/news/         News articles (Markdown)
content.config.ts     Content collections and their frontmatter schemas
server/routes/        rss.xml, sitemap.xml, robots.txt, the search index (search.json) and moonbase-arrivals.json
scripts/              Content and link checks, the old-wiki import script
docker/               nginx config for the Docker image
public/               Files served as-is (favicon)
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

- Website code: [MIT](LICENSE)
- Documentation and news (`content/`): [CC BY-SA 4.0](LICENSE-CONTENT.md)
