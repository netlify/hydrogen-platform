# Hydrogen on Netlify Edge Functions

This package is a Hydrogen platform that allows you to deploy your site to Netlify Edge Functions.

## Installation

```shell
npm i -D @netlify/hydrogen-platform
```

Then add the plugin to your Vite config:

```js
// vite.config.js

import { defineConfig } from 'vite'
import hydrogen from '@shopify/hydrogen/plugin'
import netlifyPlugin from '@netlify/hydrogen-platform/plugin'

export default defineConfig({
  plugins: [hydrogen(), netlifyPlugin()],
  //   ...
})
```

Then when you run `shopify hydrogen build` it will generate the correct files to deploy to Netlify Edge.

Netlify detects Hydrogen sites, so you should have the correct settings already, but if you need to set them manually you can use the `netlify.toml` or Netlify UI to do so:

```toml
# netlify.toml
[build]
command = "npm run build"
publish = "dist/client"
```
