import { describe, expect, it } from 'vitest'
import {
  expandString, isoDay, parseAliases, parseConfigure, parseDepends, parseDetails, type ShellEnv
} from '../scripts/lib/moonbase-parse.ts'

const env = (values: Record<string, string>): ShellEnv => new Map(Object.entries(values))

describe('expandString', () => {
  const ctx = {
    env: env({ VERSION: '1.25.3', MODULE: 'wget', EMPTY: '' }),
    moduleVersion: (name: string) => (name === 'kf5' ? '5.116.0' : null)
  }

  // Forms found in real DETAILS files
  it.each([
    ['$MODULE-$VERSION.tar.gz', 'wget-1.25.3.tar.gz'],
    ['${MODULE}_${VERSION}', 'wget_1.25.3'],
    ['${VERSION%.*}', '1.25'],
    ['${VERSION%%.*}', '1'],
    ['${VERSION#*.}', '25.3'],
    ['${VERSION##*.}', '3'],
    ['${VERSION//./_}', '1_25_3'],
    ['${VERSION//\\./_}', '1_25_3'],
    ['${VERSION/./-}', '1-25.3'],
    ['${VERSION:0:4}', '1.25'],
    ['${VERSION::3}', '1.2'],
    ['${VERSION:2}', '25.3'],
    ['${X11R7_PREFIX:-/usr}', '/usr'],
    ['${EMPTY:-fallback}', 'fallback'],
    ['${EMPTY-kept}', ''],
    ['${MODULE^^}', 'WGET'],
    ['$(echo $VERSION | cut -d. -f1,2)', '1.25'],
    ['$(echo $VERSION | cut -d. -f3)', '3'],
    ['$(module_version kf5)', '5.116.0'],
    ['costs \\$5', 'costs $5']
  ])('%s', (text, expected) => {
    expect(expandString(text, ctx)).toBe(expected)
  })

  it.each(['$(date +%Y%m%d)', '$UNSET', '${UNSET%.*}', '$(module_version nothing)', '`uname -m`'])(
    'refuses to guess %s',
    (text) => {
      expect(() => expandString(text, ctx)).toThrow()
    }
  )
})

describe('parseDetails', () => {
  const details = (text: string) => parseDetails(text, { env: env({ GNU_URL: 'https://ftpmirror.gnu.org' }) })

  it('reads assignments, arrays, quotes and the description', () => {
    const { env, unresolved, description } = details(`
          MODULE=wget
         VERSION=1.25.0   # the latest
          SOURCE=$MODULE-$VERSION.tar.gz
   SOURCE_URL[0]=$GNU_URL/$MODULE
   SOURCE_URL[1]=https://ftp.gnu.org/pub/gnu/$MODULE
         ENTERED=20010922
           SHORT="wget retrieves 'files' from the web"
      LITERAL='$NOT_EXPANDED'
cat << EOF
    wget is a free utility.

    It is non-interactive.
EOF
`)
    expect(env.get('VERSION')).toBe('1.25.0')
    expect(env.get('SOURCE')).toBe('wget-1.25.0.tar.gz')
    expect(env.get('SOURCE_URL')).toBe('https://ftpmirror.gnu.org/wget')
    expect(env.get('SOURCE_URL[1]')).toBe('https://ftp.gnu.org/pub/gnu/wget')
    expect(env.get('SHORT')).toBe('wget retrieves \'files\' from the web')
    expect(env.get('LITERAL')).toBe('$NOT_EXPANDED')
    expect(unresolved.size).toBe(0)
    expect(description).toBe('wget is a free utility.\n\nIt is non-interactive.')
  })

  it('keeps the main branch of an if/else and assignments inside an if', () => {
    const { env } = details(`
MODULE=linux
VERSION=7.3.5
BASE=$(echo $VERSION | cut -d. -f1,2)
if [ -n "$(echo $VERSION | cut -d. -f3)" ] ; then
  SOURCE2=patch-$VERSION.xz
else
  SOURCE2=none
fi
cat << EOF
EOF
`)
    expect(env.get('BASE')).toBe('7.3')
    expect(env.get('SOURCE2')).toBe('patch-7.3.5.xz')
  })

  it('marks what it cannot work out instead of guessing', () => {
    const { env, unresolved } = details('MODULE=snapshot\nVERSION=$(date +%Y%m%d)\nSOURCE=$MODULE-$VERSION.tar.gz\n')
    expect(unresolved).toEqual(new Set(['VERSION', 'SOURCE']))
    expect(env.has('VERSION')).toBe(false)
  })

  it('has no description when the heredoc is empty', () => {
    expect(details('MODULE=seed\ncat << EOF\nEOF\n').description).toBeNull()
  })
})

describe('parseDepends', () => {
  const parse = (text: string) => parseDepends(text, { env: env({ MODULE: 'curl' }) })

  it('reads required and optional dependencies, with continuations and comments', () => {
    expect(parse(`
# required
depends %SSL
depends nghttp2   # HTTP/2
optional_depends zlib \\
                 "--with-zlib" "--without-zlib" \\
                 "for compressed transfers" "y"
optional_depends libpsl "" "" "for public suffix checks"
optional_depends brotli "" "" "for brotli" n
`)).toEqual([
      { module: '%SSL' },
      { module: 'nghttp2' },
      { module: 'zlib', optional: { description: 'for compressed transfers', default: true } },
      { module: 'libpsl', optional: { description: 'for public suffix checks', default: null } },
      { module: 'brotli', optional: { description: 'for brotli', default: false } }
    ])
  })

  it('marks dependencies inside if blocks and after && as conditional', () => {
    expect(parse(`
if module_installed systemd ; then
  depends dbus
fi
in_depends $MODULE gnutls && depends nettle
if [ "$X" = y ]; then depends one; depends two; fi
case "$ARCH" in
  x86_64) depends nasm ;;
esac
depends after
`)).toEqual([
      { module: 'dbus', conditional: true },
      { module: 'nettle', conditional: true },
      { module: 'one', conditional: true },
      { module: 'two', conditional: true },
      { module: 'nasm', conditional: true },
      { module: 'after' }
    ])
  })

  it('reads optional_depends_one_of, with @ marking the preferred choice', () => {
    expect(parse('optional_depends_one_of "a spell checker" @aspell "" "" hunspell "" ""')).toEqual([
      { module: 'aspell', optional: { description: 'a spell checker', default: true } },
      { module: 'hunspell', optional: { description: 'a spell checker', default: null } }
    ])
  })
})

describe('parseConfigure', () => {
  it('reads mquery questions and their defaults', () => {
    expect(parseConfigure(`
mquery COLOR  "Enable color and syntax highlighting?" y
if [ "$X" ]; then
  mquery NANORC "Enable use of
     .nanorc file?" n "--enable-nanorc" "--disable-nanorc"
fi
mquery WHAT "No default?"
`, { env: env({}) })).toEqual([
      { question: 'Enable color and syntax highlighting?', default: true },
      { question: 'Enable use of .nanorc file?', default: false },
      { question: 'No default?', default: null }
    ])
  })
})

describe('parseAliases', () => {
  it('lists providers per alias in order, once each', () => {
    expect(parseAliases('%SSL:openssl\n%SSL:libressl\n# comment\n%SSL:openssl\n%JPEG:libjpeg-turbo\n')).toEqual({
      '%SSL': ['openssl', 'libressl'],
      '%JPEG': ['libjpeg-turbo']
    })
  })
})

describe('isoDay', () => {
  it.each([['20010922', '2001-09-22'], ['2001092', null], ['20011341', null], [undefined, null]])('%s', (value, expected) => {
    expect(isoDay(value)).toBe(expected)
  })
})
