// @ts-ignore
import handleRequest from '/src/App.server'
// @ts-ignore
import indexTemplate from '/dist/client/index.html?raw'
// @ts-ignore
import staticPaths from '@static-manifest'

const handler = async (request: Request, context: any) => {
  const { pathname } = new URL(request.url)

  // Serve static assets from the CDN
  if (pathname.startsWith('/assets/') || staticPaths.has(pathname)) {
    return context.next()
  }

  // Badly-behaved libraries look for window instead of document to
  // check if it's in a browser.
  delete (globalThis as any).window

  // This is where Hydrogen looks for the env var
  ;(globalThis as any).Oxygen ||= { env: {} }
  ;(globalThis as any).Oxygen.env.HYDROGEN_ENABLE_WORKER_STREAMING = true

  try {
    return await handleRequest(request, {
      indexTemplate,
      context,
      buyerIpHeader: 'x-nf-client-connection-ip',
    })
  } catch (error: any) {
    return new Response(error.message || error.toString(), { status: 500 })
  }
}

export default handler
