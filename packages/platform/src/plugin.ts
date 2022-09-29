import netlifyPlugin from '@netlify/vite-plugin-netlify-edge'

import type { Plugin, ResolvedConfig } from 'vite'

const plugin = (): Array<Plugin> => {
  let resolvedConfig: ResolvedConfig
  const platformEntrypoint = require.resolve(
    '@netlify/hydrogen-platform/handler'
  )
  return [
    netlifyPlugin(),
    {
      name: 'vite-plugin-netlify-hydrogen',
      config(config) {
        // If we're building for SSR, ensure we use the Netlify entrypoint and output directory
        if (config?.build?.ssr) {
          return {
            build: {
              ssr: platformEntrypoint,
              outDir: '.netlify/edge-functions/handler',
            },
          }
        }
      },
      configResolved(config) {
        // Save the config for later use
        resolvedConfig = config
      },
    },
  ]
}

export default plugin
