# Lunar Linux website

The website and documentation for [Lunar Linux](https://lunar-linux.org/), a source-based Linux
distribution. It is a fully static site built with [Nuxt 4](https://nuxt.com/),
[Nuxt Content](https://content.nuxt.com/) and [Tailwind CSS](https://tailwindcss.com/).

- News and documentation are Markdown files in [`content/`](content/)
- Every page is prerendered to plain HTML; the build output can be served by any static web server

## Requirements

- Node.js 24 LTS (22.22+ also works); the version is pinned in `.nvmrc` and `.tool-versions`
- Yarn 1 (`corepack enable` or `npm i -g yarn`)
- Docker (optional)

## Develop locally

```bash
yarn install
yarn dev          # http://localhost:3000, with hot reload
```

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

## Run with Docker

The image builds the static site and serves it with nginx.

```bash
docker compose up --build      # http://localhost:8080
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
yarn check-content    # frontmatter + internal links in content/
yarn generate
yarn check-links      # every link and #anchor in the built site (add --external for outside URLs)
yarn verify           # all of the above
```

The build itself also fails if any page links to a page that doesn't exist.
`href="#"` placeholders are reported as warnings by `check-links`.

## Continuous integration and previews

- `.github/workflows/ci.yml` runs on every push and pull request: lint, typecheck, content check,
  root and sub-path builds with link checks, an informational external-link check, and a Docker
  build with smoke tests.
- `.github/workflows/pages.yml` deploys a preview to GitHub Pages on every push to `main`. One-time
  setup: *Settings → Pages → Source: GitHub Actions*. Previews are marked `noindex`.

## Project layout

```text
app/                  Nuxt application (pages, components, composables, layouts, styles)
content/docs/         Documentation pages (Markdown)
content/news/         News articles (Markdown)
content.config.ts     Content collections and their frontmatter schemas
server/routes/        rss.xml, sitemap.xml, robots.txt and the search index (search.json)
scripts/              Content and link checks, the old-wiki import script
docker/               nginx config for the Docker image
public/               Files served as-is (favicon)
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

- Website code: [MIT](LICENSE)
- Documentation and news (`content/`): [CC BY-SA 4.0](LICENSE-CONTENT.md)
