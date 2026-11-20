# syntax=docker/dockerfile:1

# Static build of the Lunar Linux website, served by nginx.
#
#   docker build -t lunar-www .
#   docker run --rm -p 8080:80 lunar-www          → http://localhost:8080/
#
# Build for a sub-path (e.g. served at https://example.org/lunar/):
#   docker build -t lunar-www \
#     --build-arg NUXT_APP_BASE_URL=/lunar/ \
#     --build-arg NUXT_PUBLIC_SITE_URL=https://example.org/lunar/ .

# --- Build -------------------------------------------------------------------
FROM node:24-alpine AS build

ARG NUXT_APP_BASE_URL=/
ARG NUXT_PUBLIC_SITE_URL=https://lunar-linux.org/
ENV NUXT_APP_BASE_URL=${NUXT_APP_BASE_URL} \
    NUXT_PUBLIC_SITE_URL=${NUXT_PUBLIC_SITE_URL} \
    NUXT_TELEMETRY_DISABLED=1

WORKDIR /app

COPY package.json yarn.lock ./
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn \
    yarn install --frozen-lockfile --ignore-scripts

COPY . .
RUN yarn nuxt prepare \
 && yarn check-content \
 && yarn generate \
 && yarn check-links

# --- Serve -------------------------------------------------------------------
FROM nginx:1.30-alpine

ARG NUXT_APP_BASE_URL=/
# Substituted into the nginx config template at container start.
ENV BASE_URL=${NUXT_APP_BASE_URL}

COPY docker/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --chmod=755 docker/40-base-url-redirect.sh /docker-entrypoint.d/
# Drop the stock nginx welcome page; only the site is served.
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/.output/public /usr/share/nginx/html${NUXT_APP_BASE_URL}

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -q -O /dev/null "http://127.0.0.1${BASE_URL}" || exit 1
