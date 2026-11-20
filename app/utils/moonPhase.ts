/** Length of the lunar cycle (new moon to new moon), in days. */
export const SYNODIC_MONTH_DAYS = 29.530588853

/** A known new moon: 6 January 2000, 18:14 UTC. */
const REFERENCE_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14)

/**
 * Position in the lunar cycle for a date, 0–1: 0 = new moon, 0.25 = first quarter,
 * 0.5 = full moon, 0.75 = last quarter. Accurate to within about a day, which is plenty for a picture.
 */
export const moonPhaseAt = (date: Date = new Date()) => {
  const days = (date.getTime() - REFERENCE_NEW_MOON) / 86_400_000
  const age = ((days % SYNODIC_MONTH_DAYS) + SYNODIC_MONTH_DAYS) % SYNODIC_MONTH_DAYS
  return age / SYNODIC_MONTH_DAYS
}

const PHASE_NAMES = [
  'New moon',
  'Waxing crescent',
  'First quarter',
  'Waxing gibbous',
  'Full moon',
  'Waning gibbous',
  'Last quarter',
  'Waning crescent'
] as const

/** The common name for a phase (0–1), e.g. "Waxing gibbous". */
export const moonPhaseName = (phase: number) =>
  PHASE_NAMES[Math.round((((phase % 1) + 1) % 1) * 8) % 8]!

/** Fraction of the disc that is lit (0–1). */
export const moonIllumination = (phase: number) => (1 - Math.cos(2 * Math.PI * phase)) / 2
