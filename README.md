# Hydrogen on Netlify Edge Functions

This package is a Hydrogen platform that allows you to deploy your site to Netlify Edge. The easiest way to get started is using a template, but you can change your existing site to use Netlify Edge Functions by installing this package and following these instructions.

## Installation

```shell
npm i -D @netlify/hydrogen-platform
```

Then add the plugin to your Vite config:

```js
// vite.config.js

import netlifyPlugin from '@netlify/hydrogen-platform/plugin'
import shopifyConfig from './shopify.config'

export default defineConfig({
  plugins: [hydrogen(shopifyConfig), netlifyPlugin()],
  //   ...
})
```

You then need to specify the SSR entrypoint in your build command:

```json
// package.json
"scripts": {
    "build" "npm run build:client && npm run build:ssr",
    "build:client": "vite build --outDir dist/client --manifest",
    "build:ssr": "cross-env WORKER=true vite build --ssr @netlify/hydrogen-platform/handler",
}
```

Your Netlify site should be configured to publish the `dist/client` directory:

```toml
# netlify.toml
[build]
command = "npm run build"
publish = "dist/client"
```
