// @ts-ignore Replaced by vite during compilation
import handleRequest from '__SERVER_ENTRY__'
// @ts-ignore
import indexTemplate from '__INDEX_TEMPLATE__?raw'
// @ts-ignore
import staticPaths from '@static-manifest'

const handler = async (request: Request, context: any) => {
  const { pathname } = new URL(request.url)

  // Serve static assets from the CDN
  if (pathname.startsWith('/assets/') || staticPaths.has(pathname)) {
    return
  }

  ;(globalThis as any).Oxygen ||= {}
  // @ts-ignore Deno global is available at runtime
  ;(globalThis as any).Oxygen.env = Deno.env.toObject()

  // IP is on the context object. By default, this is where Hydrogen looks for it
  request.headers.set('x-forwarded-for', context.ip)

  try {
    return await handleRequest(request, {
      indexTemplate,
      context,
    })
  } catch (error: any) {
    return new Response(error.message || error.toString(), { status: 500 })
  }
}

export default handler
