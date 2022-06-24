// @ts-check
import { existsSync } from 'node:fs'
import { cp, rm, readdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
const source = resolve('upstream', 'templates')
const destination = resolve('demos')
if (existsSync(destination)) {
  await rm(destination, { recursive: true })
}

if (!existsSync(source)) {
  console.error(`Could not find templates at ${source}`)
  process.exit(1)
}

await cp(source, destination, {
  recursive: true,
})

async function addPlatformDependency(root) {
  const packageJsonFile = resolve(root, 'package.json')
  if (!existsSync(packageJsonFile)) {
    return
  }
  const templatePackageJson = JSON.parse(
    await readFile(packageJsonFile, 'utf8')
  )
  templatePackageJson.devDependencies['@netlify/hydrogen-platform'] =
    'file:../..'
  await writeFile(packageJsonFile, JSON.stringify(templatePackageJson, null, 2))
}

const templates = await readdir(destination)
for (const template of templates) {
  if (!template.endsWith('-js') && !template.endsWith('-ts')) {
    continue
  }
  const templateDir = resolve(destination, template)
  await addPlatformDependency(templateDir)
  // Strip the -ts or -js from the name
  const normalizedTemplate = template.slice(0, -3)
  await cp(resolve('scripts', 'templates', normalizedTemplate), templateDir, {
    recursive: true,
  })
}
