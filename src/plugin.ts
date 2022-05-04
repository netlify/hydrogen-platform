import netlifyPlugin from '@netlify/vite-plugin-netlify-edge'
import { normalizePath } from 'vite'
import path from 'path'
import glob from 'fast-glob'
import MagicString from 'magic-string'

import type { Plugin, ResolvedConfig } from 'vite'

const HYDROGEN_DEFAULT_SERVER_ENTRY = '/src/App.server'
const PLATFORM_MODULE = '@netlify/hydrogen-platform/handler'

const plugin = (): Array<Plugin> => {
  let resolvedConfig: ResolvedConfig
  let platformEntryPath: string
  return [
    netlifyPlugin({
      additionalStaticPaths: (config) =>
        glob
          .sync('*.js', {
            cwd: path.resolve(config.root, 'dist/client'),
          })
          .map((file) => `${config.base}${encodeURIComponent(file)}`),
    }),
    {
      name: 'vite-plugin-netlify-hydrogen',
      configResolved(config) {
        resolvedConfig = config
      },
      resolveId(id, importer) {
        if (normalizePath(id).endsWith(PLATFORM_MODULE)) {
          const platformPath = path.dirname(
            require.resolve('@netlify/hydrogen-platform/package.json')
          )
          platformEntryPath = path.resolve(platformPath, 'dist', 'handler.mjs')

          return this.resolve(platformEntryPath, importer, {
            skipSelf: true,
          })
        }
        return null
      },
      transform(code, id) {
        if (normalizePath(id).endsWith(platformEntryPath)) {
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
