import { defineConfig } from 'vitest/config'

// Unit tests for plain functions and scripts; the pages themselves are covered by
// `yarn generate` + `yarn check-links`.
export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    environment: 'node'
  }
})
