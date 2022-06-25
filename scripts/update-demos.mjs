// @ts-check
import { existsSync } from 'node:fs'
import { cp, rm, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { execa } from 'execa'
const destination = resolve('demos')
if (existsSync(destination)) {
  await rm(destination, { recursive: true })
}

const templates = ['hello-world-ts', 'demo-store-ts']

for (const template of templates) {
  await execa('npx', [
    '@shopify/create-hydrogen@latest',
    '--template',
    template,
    '--path',
    'demos',
    '--name',
    template,
    '-d',
    'yarn',
  ])
  const templateDir = resolve(destination, template)
  await addPlatformDependency(templateDir)
  // Strip the -ts or -js from the name
  const normalizedTemplate = template.slice(0, -3)
  await cp(resolve('scripts', 'templates', normalizedTemplate), templateDir, {
    recursive: true,
  })
}

async function addPlatformDependency(root) {
  const packageJsonFile = resolve(root, 'package.json')
  if (!existsSync(packageJsonFile)) {
    return
  }
  const templatePackageJson = JSON.parse(
    await readFile(packageJsonFile, 'utf8')
  )
  templatePackageJson.devDependencies['@netlify/hydrogen-platform'] = '*'
  await writeFile(packageJsonFile, JSON.stringify(templatePackageJson, null, 2))
}
