import { handleRequest, indexTemplate } from '@shopify/hydrogen/platforms'
// @ts-ignore
import staticPaths from '@static-manifest'

import { InMemoryCache } from '@shopify/hydrogen/cache/in-memory'
import { RuntimeContext } from '@shopify/hydrogen/types'

const memoryCache = new InMemoryCache()

;(globalThis as any).Oxygen ||= {}
// @ts-ignore Deno global is available at runtime
;(globalThis as any).Oxygen.env = Deno.env.toObject()

const handler = async (request: Request, context: any) => {
  const { pathname } = new URL(request.url)

  // Serve static assets from the CDN
  if (pathname.startsWith('/assets/') || staticPaths.has(pathname)) {
    return
  }

  // Netlify Edge Functions currently do not support CacheStorage, so we fall back to in-memory caching until they do.
  const cache =
    'caches' in globalThis ? await caches.open('hydrogen') : memoryCache

  // IP is on the context object. By default, this is where Hydrogen looks for it
  request.headers.set('x-forwarded-for', context.ip)

  // no-op, because we don't need to wait
  const waitUntil: RuntimeContext['waitUntil'] = () => {}

  try {
    return await handleRequest(request, {
      indexTemplate,
      context: { waitUntil, ...context },
      cache,
    })
  } catch (error: any) {
    return new Response(error.message || error.toString(), { status: 500 })
  }
}

export default handler
