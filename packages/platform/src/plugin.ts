import netlifyPlugin from '@netlify/vite-plugin-netlify-edge'
import { normalizePath } from 'vite'
import path from 'path'
import MagicString from 'magic-string'

import type { Plugin, ResolvedConfig } from 'vite'

const HYDROGEN_DEFAULT_SERVER_ENTRY = '/src/App.server'

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
      transform(code, id) {
        // Replace the magic strings in the server entrypoint with the correct values
        if (normalizePath(id) === platformEntrypoint) {
          code = code
            .replace(
              '__SERVER_ENTRY__',
              process.env.HYDROGEN_SERVER_ENTRY || HYDROGEN_DEFAULT_SERVER_ENTRY
            )
            .replace(
              '__INDEX_TEMPLATE__',
              process.env.HYDROGEN_INDEX_TEMPLATE ||
                normalizePath(
                  path.resolve(
                    resolvedConfig.root,
                    'dist',
                    'client',
                    'index.html'
                  )
                )
            )

          const ms = new MagicString(code)
          return {
            code: ms.toString(),
            map: ms.generateMap({ file: id, source: id }),
          }
        }
      },
    },
  ]
}

export default plugin
