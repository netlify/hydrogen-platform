// @ts-check
import { existsSync } from 'node:fs'
import { cp, rm, readFile, writeFile, unlink } from 'node:fs/promises'
import { resolve } from 'node:path'
import { execa } from 'execa'
const destination = resolve('demos')
if (existsSync(destination)) {
  await rm(destination, { recursive: true })
}

const templates = ['hello-world', 'demo-store']

for (const template of templates) {
  await execa('npx', [
    '@shopify/create-hydrogen@latest',
    '--template',
    template,
    '--ts',
    '--path',
    'demos',
    '--name',
    template,
  ])
  const templateDir = resolve(destination, template)
  await addPlatformDependency(templateDir)
  await cp(resolve('scripts', 'templates', template), templateDir, {
    recursive: true,
  })

  await unlink(resolve('scripts', 'templates', template, '.git'))
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
