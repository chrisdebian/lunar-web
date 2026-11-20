// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    ignores: ['docs-imported-staging/**', '.claude-trace/**', '.playwright-mcp/**']
  }
)
