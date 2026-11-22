/*
 * The split-flap engine behind the arrivals board on the homepage:
 * text flaps through random characters and settles one tile at a time, left to right. The tiles
 * themselves are the global `.flaps`/`.flap` styles in main.css.
 *
 * Each board gets its own engine; it stops when the component unmounts. Flapping is kept to the
 * homepage: lists elsewhere (the /modules pages) read better as plain rows.
 */

const FLAP_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789.-+'
const TICK_MS = 55 // flaps change about 18 times a second
const CHAR_MS = 45 // each next tile in a cell settles this much later
const RATTLE_MS = 400 // how long a cell rattles before its first tile settles

const randomChar = () => FLAP_CHARS[Math.floor(Math.random() * FLAP_CHARS.length)]!

/** Pads (or truncates with "…") to exactly `width` characters, like a fixed row of flaps. */
export const fitFlaps = (text: string | null | undefined, width: number) => {
  const value = text ?? '' // a missing field leaves blank tiles, not a broken board
  return value.length > width ? `${value.slice(0, width - 1)}…` : value.padEnd(width, ' ')
}

type Flight = { target: string, start: number, apply: (text: string) => void, done?: () => void, tag?: unknown }

export const useSplitFlap = () => {
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
          return now < flight.start - RATTLE_MS ? ' ' : randomChar()
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

  /**
   * Flaps `target` into place, starting to settle after `delay` ms (it rattles for 400 ms first).
   * `tag` ties it to something (a board row), so `cancel(tag)` can stop it.
   */
  const flap = (target: string, delay: number, apply: (text: string) => void, done?: () => void, tag?: unknown) => {
    flights.add({ target, start: performance.now() + delay + RATTLE_MS, apply, done, tag })
    frame ||= requestAnimationFrame(loop)
  }

  const cancel = (tag: unknown) => {
    for (const flight of flights) if (flight.tag === tag) flights.delete(flight)
  }

  const stop = () => {
    cancelAnimationFrame(frame)
    frame = 0
    flights.clear()
  }

  onBeforeUnmount(stop)

  return { flap, cancel, stop }
}
