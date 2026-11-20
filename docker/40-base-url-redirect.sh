#!/bin/sh
# When the site is built for a sub-path (BASE_URL != "/"), redirect "/" to it.
set -eu
mkdir -p /etc/nginx/snippets
if [ "${BASE_URL:-/}" != "/" ]; then
  printf 'location = / {\n    return 302 %s;\n}\n' "$BASE_URL" > /etc/nginx/snippets/base-url-redirect.conf
fi
