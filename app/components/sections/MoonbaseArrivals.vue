<template>
  <section
    v-if="rows.length"
    id="moonbase"
    ref="section"
    class="px-6 py-24"
    aria-labelledby="moonbase-title"
  >
    <div class="container mx-auto max-w-6xl">
      <div class="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h2
            id="moonbase-title"
            class="text-3xl font-bold tracking-[-0.03em] text-white sm:text-4xl"
          >
            Arrivals at the moonbase
          </h2>
          <p class="mt-4 max-w-xl text-gray-400">
            New versions land in the moonbase every day. Your next <code class="rounded bg-white/5 px-1.5 py-0.5 text-sm text-indigo-200">lunar update</code>
            compiles them for your machine.
          </p>
        </div>
        <p class="flex items-center gap-3 text-sm text-gray-400">
          <span
            class="flaps text-base"
            aria-hidden="true"
          ><span
            v-for="(char, i) in shownTotal"
            :key="i"
            class="flap"
          >{{ char }}</span></span>
          <span><span class="sr-only">{{ board.total }} </span>updates in the last {{ board.days }} days</span>
        </p>
      </div>

      <!-- The board. Tiles are decoration; each row carries its text for screen readers. -->
      <div class="board-frame mt-10">
        <div class="board">
          <div
            class="board-row board-head"
            aria-hidden="true"
          >
            <span>Module</span>
            <span>Version</span>
            <span class="show-md">Gate</span>
            <span class="show-md">Landed</span>
            <span class="show-lg">Crew</span>
            <span class="show-md">Status</span>
            <!-- Moonbase time, flapping every minute -->
            <span class="board-clock">
              <span class="flaps"><span
                v-for="(char, i) in clock"
                :key="i"
                class="flap"
              >{{ char }}</span></span>
              <span>UTC</span>
            </span>
          </div>

          <ol>
            <li
              v-for="(row, index) in rows"
              :key="row.module"
              class="board-row group relative"
              @mouseenter="rattle(index)"
            >
              <a
                :href="row.url"
                :title="`${row.module} ${row.version}`"
                class="absolute inset-0 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300"
              >
                <span class="sr-only">{{ row.module }} {{ row.version }}, landed in moonbase-{{ row.gate }} <template v-if="row.crew">by {{ row.crew }} </template>on {{ row.landed }}</span>
              </a>
              <span
                v-for="column in COLUMNS"
                :key="column.key"
                class="flaps"
                :class="column.className"
                aria-hidden="true"
              ><span
                v-for="(char, i) in shown[index]![column.key]"
                :key="i"
                class="flap"
                :class="column.key === 'status' ? `is-${statusOf(index)}` : ''"
              >{{ char }}</span></span>
              <span
                class="status-light"
                :class="`is-${statusOf(index)}`"
                aria-hidden="true"
              />
            </li>
          </ol>
        </div>
      </div>

      <div class="mt-6 flex flex-wrap items-center justify-between gap-x-8 gap-y-3 text-sm text-gray-400">
        <p>
          Install any of them with
          <code class="ml-1 rounded bg-white/5 px-1.5 py-0.5 text-gray-100"><span
            class="text-purple-300 select-none"
            aria-hidden="true"
          >$ </span>lin &lt;module&gt;</code>
        </p>
        <a
          href="https://github.com/orgs/lunar-linux/repositories?q=moonbase"
          class="font-medium text-indigo-300 transition-colors hover:text-white"
        >Follow the moonbase on GitHub</a>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
type Arrival = { module: string, version: string, gate: string, crew: string, date: string, url: string }
type Board = { arrivals: Arrival[], total: number, days: number }
type ColumnKey = 'module' | 'version' | 'gate' | 'landed' | 'crew' | 'status'
type Cells = Record<ColumnKey, string>

/*
 * Width of each column in tiles. Phones show module and version (plus the status light), tablets
 * add the gate, date and status (`show-md`), wide screens the crew (`show-lg`). The grid tracks
 * in the <style> block follow the same widths and order.
 */
const COLUMNS: { key: ColumnKey, width: number, className?: string }[] = [
  { key: 'module', width: 12 },
  { key: 'version', width: 8 },
  { key: 'gate', width: 6, className: 'show-md' },
  { key: 'landed', width: 6, className: 'show-md' },
  { key: 'crew', width: 10, className: 'show-lg' },
  { key: 'status', width: 10, className: 'show-md' }
]
const WIDTH = Object.fromEntries(COLUMNS.map(column => [column.key, column.width])) as Record<ColumnKey, number>
const STATUS = { orbit: 'In orbit', descending: 'Descending', landed: 'Landed' } as const
type Status = keyof typeof STATUS

/** Pads (or truncates with "…") to exactly `width` characters, like a fixed row of flaps. */
const fit = (text: string | undefined, width: number) => {
  const value = text ?? '' // a missing field leaves blank tiles, not a broken board
  return value.length > width ? `${value.slice(0, width - 1)}…` : value.padEnd(width, ' ')
}

const { data } = await useFetch<Board>('/moonbase-arrivals.json', {
  key: 'moonbase-arrivals',
  default: () => ({ arrivals: [], total: 0, days: 30 })
})
const board = computed(() => data.value)

const rows = computed(() => board.value.arrivals.map(arrival => ({
  ...arrival,
  landed: new Date(arrival.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
})))

const finalCells = (index: number): Cells => {
  const row = rows.value[index]!
  return {
    module: fit(row.module, WIDTH.module),
    version: fit(row.version, WIDTH.version),
    gate: fit(row.gate, WIDTH.gate),
    landed: fit(row.landed, WIDTH.landed),
    crew: fit(row.crew, WIDTH.crew),
    status: fit(STATUS.landed, WIDTH.status)
  }
}

/*
 * What the tiles currently show. The server renders the final board (so it reads fine without
 * JavaScript); the browser blanks it and lets it flap into place when it scrolls into view.
 */
const shown = ref<Cells[]>(rows.value.map((_, index) => finalCells(index)))
const statuses = ref<Status[]>(rows.value.map(() => 'landed'))
const statusOf = (index: number) => statuses.value[index] ?? 'landed'
const totalText = computed(() => String(board.value.total))
const shownTotal = ref(totalText.value)
const clock = ref('--:--')

/* ---- Split-flap engine: tiles show random characters until their moment to settle ---- */

const FLAP_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789.-+'
const TICK_MS = 55 // flaps change about 18 times a second
const CHAR_MS = 45 // each next tile in a cell settles this much later
const randomChar = () => FLAP_CHARS[Math.floor(Math.random() * FLAP_CHARS.length)]!

type Flight = { target: string, start: number, apply: (text: string) => void, done?: () => void }
const flights = new Set<Flight>()
let frame = 0
let lastTick = 0

const loop = (now: number) => {
  frame = 0
  if (now - lastTick >= TICK_MS) {
    lastTick = now
    for (const flight of flights) {
      let settled = 0
      const text = [...flight.target].map((char, i) => {
        if (now >= flight.start + i * CHAR_MS) {
          settled++
          return char
        }
        return now < flight.start - 400 ? ' ' : randomChar()
      }).join('')
      flight.apply(text)
      if (settled === flight.target.length) {
        flights.delete(flight)
        flight.done?.()
      }
    }
  }
  if (flights.size) frame = requestAnimationFrame(loop)
}

/** Flaps `target` into place, starting to settle after `delay` ms (it rattles for 400 ms first). */
const flap = (target: string, delay: number, apply: (text: string) => void, done?: () => void) => {
  flights.add({ target, start: performance.now() + delay + 400, apply, done })
  frame ||= requestAnimationFrame(loop)
}

const setCell = (index: number, key: ColumnKey) => (text: string) => {
  shown.value[index]![key] = text
}

const ROW_STAGGER_MS = 260
const rowBusy = new Set<number>()

/** The landing sequence for one row: in orbit → descending → landed. */
const land = (index: number, delay: number) => {
  rowBusy.add(index)
  const target = finalCells(index)
  statuses.value[index] = 'orbit'
  flap(fit(STATUS.orbit, WIDTH.status), delay - 300, setCell(index, 'status'))
  flap(target.module, delay, setCell(index, 'module'))
  flap(target.version, delay + 250, setCell(index, 'version'))
  flap(target.gate, delay + 400, setCell(index, 'gate'))
  flap(target.crew, delay + 450, setCell(index, 'crew'))
  flap(target.landed, delay + 550, setCell(index, 'landed'), () => {
    statuses.value[index] = 'descending'
    flap(fit(STATUS.descending, WIDTH.status), -400, setCell(index, 'status'), () => {
      flap(target.status, -350, setCell(index, 'status'), () => {
        statuses.value[index] = 'landed'
        rowBusy.delete(index)
      })
    })
  })
}

/** Hovering a row makes it flap again (module and version only, it has already landed). */
const rattle = (index: number) => {
  if (rowBusy.has(index) || !started) return
  rowBusy.add(index)
  const target = finalCells(index)
  flap(target.module, -200, setCell(index, 'module'))
  flap(target.version, -100, setCell(index, 'version'), () => rowBusy.delete(index))
}

const updateClock = (animate: boolean) => {
  const now = new Date()
  const time = `${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}`
  if (time === clock.value) return
  const show = (text: string) => {
    clock.value = text
  }
  if (animate) flap(time, -150, show)
  else show(time)
}

const section = useTemplateRef<HTMLElement>('section')
let started = false
let observer: IntersectionObserver | undefined
let clockTimer: ReturnType<typeof setInterval> | undefined

const start = () => {
  if (started) return
  started = true
  rows.value.forEach((_, index) => land(index, index * ROW_STAGGER_MS))
  flap(totalText.value, rows.value.length * ROW_STAGGER_MS, (text) => {
    shownTotal.value = text
  })
}

onMounted(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  updateClock(false)
  clockTimer = setInterval(() => updateClock(!reducedMotion), 5000)
  if (reducedMotion || !section.value) {
    started = true
    return
  }

  // Blank board, waiting for arrivals
  shown.value = rows.value.map(() => ({
    module: ' '.repeat(WIDTH.module),
    version: ' '.repeat(WIDTH.version),
    gate: ' '.repeat(WIDTH.gate),
    landed: ' '.repeat(WIDTH.landed),
    crew: ' '.repeat(WIDTH.crew),
    status: ' '.repeat(WIDTH.status)
  }))
  statuses.value = rows.value.map(() => 'orbit')
  shownTotal.value = ' '.repeat(totalText.value.length)

  observer = new IntersectionObserver((entries) => {
    if (entries.some(entry => entry.isIntersecting)) {
      observer?.disconnect()
      start()
    }
  }, { threshold: 0.3 })
  observer.observe(section.value)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  clearInterval(clockTimer)
  cancelAnimationFrame(frame)
  flights.clear()
})
</script>

<style scoped>
/* The board sizes itself to this frame's width (container query units below) */
.board-frame {
  container-type: inline-size;
}

.board {
  /* One tile and the gap between tiles, in em so the whole board scales together. Columns are
     sized in tiles so every row lines up. Narrow tiles and tight gaps keep words readable. */
  --tile: 0.82em;
  --gap: 0.06em;
  --module: calc(12 * var(--tile) + 11 * var(--gap));
  --version: calc(8 * var(--tile) + 7 * var(--gap));
  --gate: calc(6 * var(--tile) + 5 * var(--gap));
  --landed: calc(6 * var(--tile) + 5 * var(--gap));
  --crew: calc(10 * var(--tile) + 9 * var(--gap));
  --status: calc(10 * var(--tile) + 9 * var(--gap));
  border-radius: 0.75rem;
  border: 1px solid rgb(255 255 255 / 0.1);
  background: color-mix(in oklab, var(--color-gray-950) 75%, transparent);
  padding: 0.5rem;
  /*
   * Font size = frame width ÷ the board's width in em (tiles + gaps + the last column), so the
   * board fills its width on any screen without overflowing. Phones: module + version (≈ 20 em).
   */
  font-size: clamp(12px, calc((100cqi - 1.5rem) / 20), 22px);
  /* Flapping only repaints the board */
  contain: layout paint;
}

.board-row {
  display: grid;
  grid-template-columns: var(--module) var(--version) 1fr;
  align-items: center;
  column-gap: 0.8em;
  padding: 0.45rem 0.25rem;
}

/* Columns that only fit on wider screens (not Tailwind's `hidden`: the `display` set on these
   elements in this file would beat it, as utilities sit in a lower cascade layer) */
.board .show-md,
.board .show-lg,
.board-clock {
  display: none;
}

/* Tablets: + gate, landed, status and the clock (≈ 47.5 em) */
@media (min-width: 768px) {
  .board {
    padding: 1rem 1.25rem;
    font-size: clamp(12px, calc((100cqi - 3.5rem) / 47.5), 21px);
  }

  .board-row {
    grid-template-columns: var(--module) var(--version) var(--gate) var(--landed) var(--status) 1fr;
  }

  .board .show-md {
    display: inline-flex;
  }

  .board-clock {
    display: inline-flex;
  }
}

/* Wide screens: + crew (≈ 57 em) */
@media (min-width: 1024px) {
  .board {
    font-size: clamp(12px, calc((100cqi - 3.5rem) / 57), 22px);
  }

  .board-row {
    grid-template-columns: var(--module) var(--version) var(--gate) var(--landed) var(--crew) var(--status) 1fr;
  }

  .board .show-lg {
    display: inline-flex;
  }
}

.board ol .board-row + .board-row {
  border-top: 1px solid rgb(255 255 255 / 0.05);
}

.board ol .board-row:hover {
  background: rgb(255 255 255 / 0.03);
}

.board-head {
  padding-bottom: 0.6rem;
  border-bottom: 1px solid rgb(255 255 255 / 0.1);
  color: var(--color-gray-500);
}

/* Smaller labels, without changing the row's own size (the columns are sized in its em) */
.board-head > span:not(.board-clock),
.board-clock > span:last-child {
  font-size: 0.75rem;
}

/* Shown from 768px (see above) */
.board-clock {
  align-items: center;
  justify-self: end;
  gap: 0.4rem;
}

/* A row of split-flap tiles */
.flaps {
  display: inline-flex;
  gap: var(--gap, 0.06em);
}

.flap {
  position: relative;
  display: inline-grid;
  place-items: center;
  width: var(--tile, 0.82em);
  height: 1.65em;
  border-radius: 2px;
  background: linear-gradient(to bottom, #1c2244 0 50%, #171c3a 50% 100%);
  box-shadow: inset 0 -1px 0 rgb(0 0 0 / 0.45), 0 1px 0 rgb(255 255 255 / 0.03);
  /* Inter, semibold: much easier to read in small tiles than a thin monospace */
  color: var(--color-indigo-50);
  font-weight: 600;
  line-height: 1;
  white-space: pre;
  /* Keeps the split line below behind the character */
  isolation: isolate;
}

/* The split between the two halves of a flap, behind the character */
.flap::after {
  content: "";
  position: absolute;
  z-index: -1;
  inset-inline: 0;
  top: 50%;
  height: 1px;
  background: rgb(3 7 18 / 0.8);
}

.flap.is-orbit {
  color: var(--color-purple-300);
}

.flap.is-descending {
  color: var(--color-amber-300);
}

.flap.is-landed {
  color: var(--color-indigo-200);
}

/* Status light at the end of each row */
.status-light {
  justify-self: end;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 9999px;
  background: var(--color-purple-400);
  opacity: 0.5;
  transition: background-color 0.3s, opacity 0.3s;
}

.status-light.is-descending {
  background: var(--color-amber-300);
  opacity: 1;
  animation: blink 0.5s steps(2, jump-none) infinite;
}

.status-light.is-landed {
  background: var(--color-indigo-200);
  opacity: 1;
  box-shadow: 0 0 8px 1px color-mix(in oklab, var(--color-indigo-300) 60%, transparent);
}

@keyframes blink {
  50% {
    opacity: 0.25;
  }
}

@media (prefers-reduced-motion: reduce) {
  .status-light.is-descending {
    animation: none;
  }
}
</style>
