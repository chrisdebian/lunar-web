#!/bin/sh
# Writes the per-deployment nginx snippets (included at the end of the server block):
# - built for a sub-path (BASE_URL != "/"): redirect "/" to it
# - served at the root: the redirects for the old WordPress news URLs (legacy-redirects.conf)
set -eu
mkdir -p /etc/nginx/snippets
if [ "${BASE_URL:-/}" != "/" ]; then
  printf 'location = / {\n    return 302 %s;\n}\n' "$BASE_URL" > /etc/nginx/snippets/base-url-redirect.conf
else
  cp /etc/nginx/legacy-redirects.conf /etc/nginx/snippets/legacy-redirects.conf
fi
