import { defineConfig } from 'astro/config'
import { satteri } from '@astrojs/markdown-satteri'
import { stripUserManualResults } from './src/markdown/strip-example-results'

export default defineConfig({
  output: 'static',
  markdown: {
    syntaxHighlight: false,
    processor: satteri({
      mdastPlugins: [stripUserManualResults],
    }),
  },
})
