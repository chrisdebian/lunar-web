import { afterEach, describe, expect, it } from 'vitest'
import { formatDate } from '../app/utils/formatDate'

const originalTimezone = process.env.TZ

afterEach(() => {
  process.env.TZ = originalTimezone
})

describe('formatDate', () => {
  it('formats a content date', () => {
    expect(formatDate('2023-08-20')).toBe('August 20, 2023')
  })

  it('accepts a Date', () => {
    expect(formatDate(new Date('2021-05-25T00:00:00Z'))).toBe('May 25, 2021')
  })

  it('returns an empty string for a missing date', () => {
    expect(formatDate(undefined)).toBe('')
    expect(formatDate(null)).toBe('')
    expect(formatDate('')).toBe('')
  })

  // Dates are midnight UTC; a build machine west of UTC must not show the day before.
  it.each(['America/Los_Angeles', 'Pacific/Auckland'])('gives the same day in %s', (timezone) => {
    process.env.TZ = timezone
    expect(formatDate('2023-08-20')).toBe('August 20, 2023')
  })
})
