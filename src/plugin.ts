import netlifyPlugin from '@netlify-labs/vite-plugin-netlify-edge'
import { normalizePath } from 'vite'
import path from 'path'
import MagicString from 'magic-string'

import type { Plugin, ResolvedConfig } from 'vite'

const HYDROGEN_DEFAULT_SERVER_ENTRY = '/src/App.server'
const PLATFORM_MODULE = '@netlify-labs/hydrogen-platform'

const plugin = (): Array<Plugin> => {
  let resolvedConfig: ResolvedConfig

  return [
    netlifyPlugin(),
    {
      name: 'vite-plugin-netlify-hydrogen',
      configResolved(config) {
        resolvedConfig = config
      },
      resolveId(id, importer) {
        if (id === PLATFORM_MODULE) {
          const hydrogenPath = path.dirname(
            require.resolve('@netlify-labs/hydrogen-platform/package.json')
          )
          const platformEntryPath = path.resolve(
            hydrogenPath,
            'dist',
            'index.js'
          )

          return this.resolve(platformEntryPath, importer, {
            skipSelf: true,
          })
        }
        return null
      },
      transform(code, id) {
        if (id === PLATFORM_MODULE) {
          code = code
            .replace(
              '__SERVER_ENTRY__',
              process.env.HYDROGEN_SERVER_ENTRY || HYDROGEN_DEFAULT_SERVER_ENTRY
            )
            .replace(
              '__INDEX_TEMPLATE__',
              normalizePath(
                path.resolve(
                  resolvedConfig.root,
                  resolvedConfig.build.outDir,
                  '..',
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
