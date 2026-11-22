/*
 * Reads moonbase module files (DETAILS, DEPENDS, CONFIGURE, aliases) without running them.
 *
 * Lunar sources these files in bash. We can't (and won't) run thousands of shell scripts, so this is
 * a small reader for the subset of shell that modules use: assignments with quoting, parameter
 * expansion (${VERSION%.*}, ${VERSION:0:4}, ${X:-default}, ${V//./_}, …), `$(module_version kf5)`,
 * `$(echo $VERSION | cut -d. -f1,2)`, line continuations, comments, `if`/`case` blocks and the
 * long-description heredoc. Anything else (`$(date …)`, functions) counts as unresolved: the
 * value is left out rather than guessed.
 *
 * No imports, and only TypeScript that Node can strip: scripts/moonbase-index.mjs runs it directly.
 */

/** Lunar's default mirrors (lunar etc/config:87-101), for $GNU_URL and friends in DETAILS. */
export const LUNAR_URLS: Record<string, string> = {
  GNU_URL: 'https://ftpmirror.gnu.org',
  KDE_URL: 'https://download.kde.org',
  GNOME_URL: 'https://download.gnome.org',
  KERNEL_URL: 'https://cdn.kernel.org',
  SFORGE_URL: 'https://downloads.sourceforge.net/sourceforge',
  XFREE86_URL: 'http://ftp.xfree86.org/pub/XFree86',
  XORG_URL: 'https://www.x.org/releases',
  NVIDIA_URL: 'https://download.nvidia.com/XFree86',
  PATCH_URL: 'http://download.lunar-linux.org/lunar/patches/',
  MIRROR_URL: 'http://download.lunar-linux.org/lunar/mirrors/'
}

/**
 * Lunar's terminal colours (lunar etc/config), used in lin's messages: "${PROBLEM_COLOR}say yes
 * here${DEFAULT_COLOR}". Empty here, so they vanish from descriptions and questions.
 */
export const LUNAR_COLORS: Record<string, string> = Object.fromEntries([
  'CHECK_COLOR', 'DEFAULT_COLOR', 'FILE_COLOR', 'LRM_COLOR', 'MESSAGE_COLOR', 'MODULE_COLOR',
  'PROBLEM_COLOR', 'QUERY_COLOR', 'RESURRECT_COLOR', 'SYMLINK_COLOR', 'VERSION_COLOR'
].map(name => [name, '']))

/** What module files can rely on lunar to define: its mirrors and colours. */
export const LUNAR_ENV: Record<string, string> = { ...LUNAR_URLS, ...LUNAR_COLORS }

/** Variables the scripts see, by name. An array element is stored as `NAME[i]`; `NAME` is element 0. */
export type ShellEnv = Map<string, string>

export type ExpandContext = {
  env: ShellEnv
  /** `$(module_version NAME)`: another module's version */
  moduleVersion?: (module: string) => string | null
}

/** A value that couldn't be worked out without running the script. */
class Unresolved extends Error {}

// ---------------------------------------------------------------------------------------------
// Words and commands
// ---------------------------------------------------------------------------------------------

type Part = { quote: '' | '"' | '\'', text: string }
type Word = Part[]
/** A simple command; `guarded` if it runs only after `&&` or `||`. */
type Command = { words: Word[], guarded: boolean }

/** The quote still open at the end of `line` ('' if none), starting inside `quote`. Skips comments. */
const openQuoteAfter = (line: string, quote: string) => {
  for (let i = 0; i < line.length; i++) {
    const c = line[i]!
    if (quote) {
      if (c === '\\' && quote === '"') i++
      else if (c === quote) quote = ''
    } else if (c === '\\') {
      i++
    } else if (c === '"' || c === '\'') {
      quote = c
    } else if (c === '#' && (i === 0 || /\s/.test(line[i - 1]!))) {
      break // a comment: "# don't" opens no quote
    }
  }
  return quote
}

/** Joins `\`-continued lines, and lines inside a quoted string that spans several. */
const joinContinuations = (lines: string[]) => {
  const out: string[] = []
  let pending = ''
  let quote = ''
  for (const line of lines) {
    quote = openQuoteAfter(line, quote)
    if (quote) {
      pending += line + '\n'
    } else if (/(?<!\\)(?:\\\\)*\\$/.test(line)) {
      pending += line.slice(0, -1) + ' '
    } else {
      out.push(pending + line)
      pending = ''
    }
  }
  if (pending) out.push(pending)
  return out
}

/** Finds the index of the bracket closing the one at `start` (`{`/`}` or `(`/`)`), quote-aware. */
const closing = (text: string, start: number, open: string, close: string) => {
  let depth = 0
  let quote = ''
  for (let i = start; i < text.length; i++) {
    const c = text[i]!
    if (c === '\\' && quote !== '\'') {
      i++
      continue
    }
    if (quote) {
      if (c === quote) quote = ''
      continue
    }
    if (c === '"' || c === '\'') quote = c
    else if (c === open) depth++
    else if (c === close && --depth === 0) return i
  }
  return -1
}

/**
 * Splits one (joined) line into commands of words, honouring quotes and `$( … )`/`${ … }`, and
 * dropping comments. `;`, `&&`, `||` and `|` separate commands.
 */
export const parseCommands = (line: string): Command[] => {
  const commands: Command[] = []
  let words: Word[] = []
  let guarded = false
  let word: Part[] = []
  let part: Part = { quote: '', text: '' }
  let inWord = false

  const endPart = () => {
    if (part.text || part.quote) word.push(part)
    part = { quote: '', text: '' }
  }
  const endWord = () => {
    endPart()
    if (inWord) words.push(word)
    word = []
    inWord = false
  }
  const endCommand = (separator = '') => {
    endWord()
    if (words.length) commands.push({ words, guarded })
    words = []
    guarded = separator === '&&' || separator === '||'
  }

  for (let i = 0; i < line.length; i++) {
    const c = line[i]!
    if (c === '#' && !inWord) break // a comment
    if (/\s/.test(c)) {
      endWord()
      continue
    }
    if (c === ';' || c === '|' || (c === '&' && line[i + 1] === '&')) {
      const separator = line[i + 1] === c ? c + c : c
      i += separator.length - 1
      endCommand(separator)
      continue
    }
    inWord = true
    if (c === '\\') {
      // Keep the backslash: expandString reads `\$` as a literal dollar sign
      part.text += c + (line[i + 1] ?? '')
      i++
    } else if (c === '\'' || c === '"') {
      endPart()
      const end = c === '\'' ? line.indexOf('\'', i + 1) : closingQuote(line, i + 1)
      const stop = end === -1 ? line.length : end
      word.push({ quote: c, text: line.slice(i + 1, stop) })
      i = stop
    } else if (c === '$' && (line[i + 1] === '(' || line[i + 1] === '{')) {
      const [open, close] = line[i + 1] === '(' ? ['(', ')'] : ['{', '}']
      const end = closing(line, i + 1, open, close)
      const stop = end === -1 ? line.length - 1 : end
      part.text += line.slice(i, stop + 1)
      i = stop
    } else {
      part.text += c
    }
  }
  endCommand()
  return commands
}

/** The closing `"` of a double-quoted string starting at `from`, skipping `\"` and `$( … )`. */
const closingQuote = (text: string, from: number) => {
  for (let i = from; i < text.length; i++) {
    const c = text[i]!
    if (c === '\\') i++
    else if (c === '"') return i
    else if (c === '$' && (text[i + 1] === '(' || text[i + 1] === '{')) {
      const end = closing(text, i + 1, text[i + 1]!, text[i + 1] === '(' ? ')' : '}')
      if (end !== -1) i = end
    }
  }
  return -1
}

// ---------------------------------------------------------------------------------------------
// Expansion
// ---------------------------------------------------------------------------------------------

/** A shell glob as a regular expression body. */
const globSource = (glob: string) => {
  let source = ''
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i]!
    if (c === '\\') source += (glob[++i] ?? '').replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')
    else if (c === '*') source += '.*'
    else if (c === '?') source += '.'
    else if (c === '[') {
      const end = glob.indexOf(']', i + 2)
      if (end === -1) source += '\\['
      else {
        source += '[' + glob.slice(i + 1, end).replace(/^!/, '^').replace(/\\/g, '\\\\') + ']'
        i = end
      }
    } else source += c.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')
  }
  return source
}

const fullMatch = (glob: string) => new RegExp(`^(?:${globSource(glob)})$`, 's')

const trimSuffix = (value: string, glob: string, longest: boolean) => {
  const re = fullMatch(glob)
  if (longest) {
    for (let i = 0; i <= value.length; i++) if (re.test(value.slice(i))) return value.slice(0, i)
  } else {
    for (let i = value.length; i >= 0; i--) if (re.test(value.slice(i))) return value.slice(0, i)
  }
  return value
}

const trimPrefix = (value: string, glob: string, longest: boolean) => {
  const re = fullMatch(glob)
  if (longest) {
    for (let i = value.length; i >= 0; i--) if (re.test(value.slice(0, i))) return value.slice(i)
  } else {
    for (let i = 0; i <= value.length; i++) if (re.test(value.slice(0, i))) return value.slice(i)
  }
  return value
}

const replaceGlob = (value: string, glob: string, replacement: string, all: boolean) => {
  if (!glob) return value
  const re = fullMatch(glob)
  let out = ''
  let i = 0
  while (i < value.length) {
    let matched = -1
    for (let end = value.length; end > i; end--) {
      if (re.test(value.slice(i, end))) {
        matched = end
        break
      }
    }
    if (matched === -1) {
      out += value[i]
      i++
    } else {
      out += replacement
      i = matched
      if (!all) return out + value.slice(i)
    }
  }
  return out
}

/** Splits `pattern/replacement` at the first unescaped `/`. */
const splitReplace = (text: string): [string, string] => {
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '\\') i++
    else if (text[i] === '/') return [text.slice(0, i), text.slice(i + 1)]
  }
  return [text, '']
}

const lookup = (name: string, ctx: ExpandContext) => ctx.env.get(name) ?? ctx.env.get(name.replace(/\[0\]$/, ''))

/** `${ … }` without the braces. */
const expandBraced = (inner: string, ctx: ExpandContext): string => {
  const name = inner.match(/^([A-Za-z_]\w*(?:\[\d+\])?)/)?.[1]
  if (!name) throw new Unresolved(`\${${inner}}`)
  const rest = inner.slice(name.length)
  const value = lookup(name, ctx)
  const word = (text: string) => expandString(text, ctx)

  if (!rest) {
    if (value === undefined) throw new Unresolved(name)
    return value
  }
  if (rest.startsWith(':-') || rest.startsWith('-')) {
    const fallback = rest.slice(rest[0] === ':' ? 2 : 1)
    return value === undefined || (rest[0] === ':' && value === '') ? word(fallback) : value
  }
  if (rest.startsWith(':+') || rest.startsWith('+')) {
    return value === undefined || (rest[0] === ':' && value === '') ? '' : word(rest.slice(rest[0] === ':' ? 2 : 1))
  }
  if (value === undefined) throw new Unresolved(name)
  if (rest.startsWith(':')) {
    const [offsetText = '', lengthText] = rest.slice(1).split(':')
    const offset = Number(offsetText.trim() || 0)
    const start = offset < 0 ? Math.max(0, value.length + offset) : offset
    return lengthText === undefined ? value.slice(start) : value.slice(start, start + Number(lengthText.trim()))
  }
  if (rest.startsWith('%%')) return trimSuffix(value, word(rest.slice(2)), true)
  if (rest.startsWith('%')) return trimSuffix(value, word(rest.slice(1)), false)
  if (rest.startsWith('##')) return trimPrefix(value, word(rest.slice(2)), true)
  if (rest.startsWith('#')) return trimPrefix(value, word(rest.slice(1)), false)
  if (rest.startsWith('//') || rest.startsWith('/')) {
    const all = rest.startsWith('//')
    const [pattern, replacement] = splitReplace(rest.slice(all ? 2 : 1))
    return replaceGlob(value, word(pattern), word(replacement), all)
  }
  if (rest === '^^') return value.toUpperCase()
  if (rest === ',,') return value.toLowerCase()
  throw new Unresolved(`\${${inner}}`)
}

/** `$( … )` without the parentheses: only the forms modules actually use. */
const expandCommand = (inner: string, ctx: ExpandContext): string => {
  const text = inner.trim()
  const moduleVersion = text.match(/^module_version\s+(\S+)$/)
  if (moduleVersion) {
    const version = ctx.moduleVersion?.(expandString(moduleVersion[1]!, ctx))
    if (version == null) throw new Unresolved(text)
    return version
  }
  const cut = text.match(/^echo\s+(.+?)\s*\|\s*cut\s+-d\s*(['"]?)(.)\2\s+-f\s*([\d,-]+)$/)
  if (cut) {
    const [, input, , delimiter, fieldList] = cut
    const fields = expandString(input!.replace(/^"(.*)"$/, '$1'), ctx).split(delimiter!)
    const wanted = new Set<number>()
    for (const range of fieldList!.split(',')) {
      const [from, to] = range.split('-').map(n => (n === '' ? undefined : Number(n)))
      const last = range.includes('-') ? (to ?? fields.length) : from!
      for (let n = from ?? 1; n <= last; n++) wanted.add(n)
    }
    return fields.filter((_, i) => wanted.has(i + 1)).join(delimiter!)
  }
  throw new Unresolved(`$(${text})`)
}

/** Expands `$NAME`, `${ … }` and `$( … )` in unquoted or double-quoted text. */
export const expandString = (text: string, ctx: ExpandContext): string => {
  let out = ''
  for (let i = 0; i < text.length; i++) {
    const c = text[i]!
    if (c === '\\' && i + 1 < text.length) {
      out += text[++i]
    } else if (c === '`') {
      throw new Unresolved(text)
    } else if (c === '$') {
      const next = text[i + 1]
      if (next === '{' || next === '(') {
        const end = closing(text, i + 1, next, next === '{' ? '}' : ')')
        if (end === -1) throw new Unresolved(text)
        const inner = text.slice(i + 2, end)
        out += next === '{' ? expandBraced(inner, ctx) : expandCommand(inner, ctx)
        i = end
      } else {
        const name = text.slice(i + 1).match(/^[A-Za-z_]\w*/)?.[0]
        if (!name) {
          out += c
          continue
        }
        const value = lookup(name, ctx)
        if (value === undefined) throw new Unresolved(name)
        out += value
        i += name.length
      }
    } else {
      out += c
    }
  }
  return out
}

/** A word's value, or null if it can't be worked out. */
export const expandWord = (word: Word, ctx: ExpandContext): string | null => {
  try {
    return word.map(part => (part.quote === '\'' ? part.text : expandString(part.text, ctx))).join('')
  } catch (error) {
    if (error instanceof Unresolved) return null
    throw error
  }
}

const wordText = (word: Word) => word.map(part => part.text).join('')

// ---------------------------------------------------------------------------------------------
// Walking a script
// ---------------------------------------------------------------------------------------------

const KEYWORDS = new Set(['then', 'do', 'else', '{', '}'])

type Visit = (words: Word[], state: { conditional: boolean, elseBranch: boolean }) => void

/**
 * Calls `visit` for every simple command in `lines`, telling it whether the command sits inside an
 * `if`/`case`/loop and whether it's in an `else` branch. Heredocs are skipped.
 */
const walk = (lines: string[], visit: Visit) => {
  const blocks: { kind: string, elseBranch: boolean }[] = []
  for (const line of joinContinuations(lines)) {
    for (const { words, guarded } of parseCommands(line)) {
      let command = words
      while (command.length) {
        const first = wordText(command[0]!)
        if (first === 'if' || first === 'case' || first === 'for' || first === 'while' || first === 'until') {
          // The rest is the condition (`if module_installed foo`), not a command we care about
          blocks.push({ kind: first, elseBranch: false })
          command = []
        } else if (first === 'fi' || first === 'esac' || first === 'done') {
          blocks.pop()
          command = command.slice(1)
        } else if (first === 'elif') {
          const block = blocks.at(-1)
          if (block) block.elseBranch = true
          command = []
        } else if (first === 'else') {
          const block = blocks.at(-1)
          if (block) block.elseBranch = true
          command = command.slice(1)
        } else if (KEYWORDS.has(first)) {
          command = command.slice(1)
        } else if (blocks.at(-1)?.kind === 'case' && /\)$/.test(first)) {
          command = command.slice(1) // a `pattern)` label
        } else if (first === ';;') {
          command = command.slice(1)
        } else {
          break
        }
      }
      if (command.length) {
        visit(command, { conditional: guarded || blocks.length > 0, elseBranch: blocks.some(block => block.elseBranch) })
      }
    }
  }
}

const HEREDOC = /^\s*cat\s*<<-?\s*(['"]?)(\w+)\1\s*$/

/** Splits a DETAILS file into its script lines and the long-description heredoc. */
const splitHeredoc = (text: string) => {
  const script: string[] = []
  const description: string[] = []
  let end: string | null = null
  let seen = false
  for (const line of text.split('\n')) {
    if (end !== null) {
      if (line.trim() === end) end = null
      else description.push(line)
      continue
    }
    const heredoc = !seen && line.match(HEREDOC)
    if (heredoc) {
      end = heredoc[2]!
      seen = true
    } else {
      script.push(line)
    }
  }
  return { script, description }
}

/** Removes the indentation all lines share and trims blank lines at either end. */
const dedent = (lines: string[]) => {
  const indents = lines.filter(line => line.trim()).map(line => line.match(/^\s*/)![0].length)
  const indent = indents.length ? Math.min(...indents) : 0
  const text = lines.map(line => line.slice(indent).trimEnd()).join('\n').trim()
  return text || null
}

// ---------------------------------------------------------------------------------------------
// The module files
// ---------------------------------------------------------------------------------------------

const ASSIGNMENT = /^([A-Za-z_]\w*)(?:\[(\d+)\])?=/

export type Details = {
  env: ShellEnv
  /** Variables whose value couldn't be worked out */
  unresolved: Set<string>
  description: string | null
}

/** Reads a DETAILS file: its variables (with `ctx.env` as the starting point) and description. */
export const parseDetails = (text: string, ctx: ExpandContext): Details => {
  const env: ShellEnv = new Map(ctx.env)
  const unresolved = new Set<string>()
  const expand: ExpandContext = { ...ctx, env }
  const { script, description } = splitHeredoc(text)

  walk(script, (command, { elseBranch }) => {
    for (const word of command) {
      const first = word[0]
      const match = first && first.quote === '' && first.text.match(ASSIGNMENT)
      if (!match) break // a command, not an assignment
      const [prefix, name, index] = match
      const key = index && index !== '0' ? `${name}[${index}]` : name!
      // In an else branch, keep the value the main branch gave (the usual case on x86_64)
      if (elseBranch && env.has(key)) continue
      const valueWord: Word = [{ ...first, text: first.text.slice(prefix.length) }, ...word.slice(1)]
      const value = expandWord(valueWord, expand)
      if (value === null) {
        unresolved.add(key)
        env.delete(key)
      } else {
        unresolved.delete(key)
        env.set(key, value)
      }
    }
  })

  return { env, unresolved, description: dedent(description) }
}

export type RawDependency = {
  module: string
  optional?: { description: string, default: boolean | null }
  conditional?: true
}

const yesNo = (value: string | null | undefined) => {
  if (!value) return null
  if (/^y/i.test(value)) return true
  if (/^n/i.test(value)) return false
  return null
}

/** One line of text: collapses the spaces (and newlines) a removed colour code can leave behind. */
const tidy = (text: string) => text.replace(/\s+/g, ' ').trim()

/** Reads a DEPENDS file. Arguments are expanded with `ctx` (for `$MODULE` and the like). */
export const parseDepends = (text: string, ctx: ExpandContext): RawDependency[] => {
  const dependencies: RawDependency[] = []
  const arg = (word: Word | undefined) => (word ? expandWord(word, ctx) ?? wordText(word) : '')

  walk(text.split('\n'), (command, { conditional }) => {
    const name = wordText(command[0]!)
    const flags = conditional ? { conditional: true as const } : {}
    if (name === 'depends') {
      const module = arg(command[1])
      if (module) dependencies.push({ module, ...flags })
    } else if (name === 'optional_depends') {
      const module = arg(command[1])
      if (module) {
        dependencies.push({
          module,
          optional: { description: tidy(arg(command[4])), default: yesNo(arg(command[5])) },
          ...flags
        })
      }
    } else if (name === 'optional_depends_one_of') {
      // optional_depends_one_of "description" [@]module on off [@]module on off …
      const description = tidy(arg(command[1]))
      for (let i = 2; i < command.length; i += 3) {
        const raw = arg(command[i])
        if (!raw) continue
        const preferred = raw.startsWith('@')
        dependencies.push({
          module: raw.replace(/^@/, ''),
          optional: { description, default: preferred ? true : null },
          ...flags
        })
      }
    }
  })

  return dependencies
}

/** Reads the `mquery VARIABLE "question" default …` lines of a CONFIGURE file. */
export const parseConfigure = (text: string, ctx: ExpandContext) => {
  const questions: { question: string, default: boolean | null }[] = []
  walk(text.split('\n'), (command) => {
    if (wordText(command[0]!) !== 'mquery' || command.length < 3) return
    const question = (expandWord(command[2]!, ctx) ?? wordText(command[2]!)).replace(/\s+/g, ' ').trim()
    if (question) questions.push({ question, default: yesNo(command[3] ? expandWord(command[3], ctx) : null) })
  })
  return questions
}

/** Reads an `aliases` file: `%SSL:openssl` lines, one per provider, in the order lin proposes them. */
export const parseAliases = (text: string) => {
  const aliases: Record<string, string[]> = {}
  for (const line of text.split('\n')) {
    const match = line.trim().match(/^(%[\w-]+):(\S+)/)
    if (!match) continue
    const [, alias, module] = match
    const providers = (aliases[alias!] ??= [])
    if (!providers.includes(module!)) providers.push(module!)
  }
  return aliases
}

/** `20010922` → `2001-09-22`, or null if it isn't a date. */
export const isoDay = (value: string | undefined) => {
  const match = value?.match(/^(\d{4})(\d{2})(\d{2})$/)
  if (!match) return null
  const [, year, month, day] = match
  return Number(month) >= 1 && Number(month) <= 12 && Number(day) >= 1 && Number(day) <= 31
    ? `${year}-${month}-${day}`
    : null
}
