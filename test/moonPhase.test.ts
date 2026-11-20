import { describe, expect, it } from 'vitest'
import { moonIllumination, moonPhaseAt, moonPhaseName, SYNODIC_MONTH_DAYS } from '../app/utils/moonPhase'

/** Distance in days between a computed phase and a target phase, taking the wrap-around into account. */
const daysOff = (phase: number, target: number) => {
  const diff = Math.abs(phase - target) % 1
  return Math.min(diff, 1 - diff) * SYNODIC_MONTH_DAYS
}

describe('moonPhaseAt', () => {
  // A solar eclipse always falls on a new moon, a lunar eclipse on a full moon.
  it.each([
    ['2017-08-21T18:25Z', 0, 'total solar eclipse'],
    ['2024-04-08T18:17Z', 0, 'total solar eclipse'],
    ['2004-10-28T03:04Z', 0.5, 'total lunar eclipse'],
    ['2021-05-26T11:19Z', 0.5, 'total lunar eclipse'],
    ['2025-03-14T06:58Z', 0.5, 'total lunar eclipse']
  ])('%s (%s) is within a day of the right phase', (when, target) => {
    expect(daysOff(moonPhaseAt(new Date(when)), target)).toBeLessThan(1)
  })

  it('stays between 0 and 1 for dates before the reference new moon', () => {
    const phase = moonPhaseAt(new Date('1969-07-20T20:17Z'))
    expect(phase).toBeGreaterThanOrEqual(0)
    expect(phase).toBeLessThan(1)
  })
})

describe('moonPhaseName', () => {
  it.each([
    [0, 'New moon'],
    [0.125, 'Waxing crescent'],
    [0.25, 'First quarter'],
    [0.375, 'Waxing gibbous'],
    [0.5, 'Full moon'],
    [0.625, 'Waning gibbous'],
    [0.75, 'Last quarter'],
    [0.875, 'Waning crescent'],
    [0.99, 'New moon'],
    [1.25, 'First quarter'],
    [-0.25, 'Last quarter']
  ])('%s is %s', (phase, name) => {
    expect(moonPhaseName(phase)).toBe(name)
  })
})

describe('moonIllumination', () => {
  it.each([
    [0, 0],
    [0.25, 0.5],
    [0.5, 1],
    [0.75, 0.5]
  ])('phase %s is %s lit', (phase, lit) => {
    expect(moonIllumination(phase)).toBeCloseTo(lit)
  })
})
