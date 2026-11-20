/** Formats a content date (e.g. `2023-08-20`) as `August 20, 2023`, independent of the build machine's timezone. */
export const formatDate = (date?: string | Date | null) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC'
  })
}
