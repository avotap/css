#!/usr/bin/env node
import { globby } from 'globby'
import compiler from './primer-css-compiler.js'
import { dirname, join } from 'path'

import fs from 'fs'
import fsExtra from 'fs-extra'
const { mkdirp, readFile, writeFile } = fsExtra

const loadJSON = (path) => JSON.parse(fs.readFileSync(new URL(path, import.meta.url)))
const PACKAGE = loadJSON('../package.json')
const VERSION = PACKAGE.version
const VERSION_HASH = `v${VERSION}`.split('.').join('')

const inDir = 'src'
const outDir = `../avotap/public/assets`
const bundleNames = {
  'index.scss': 'avotap',
}
const bundleVersionNames = {
  avotap: `avotap-${VERSION_HASH}`,
  primitives: `avotap-primitives-${VERSION_HASH}`,
}

const files = await globby([`${inDir}/**/index.scss`])
await mkdirp(outDir)
const inPattern = new RegExp(`^${inDir}/`)
const tasks = files.map(async (from) => {
  const path = from.replace(inPattern, '')
  const name = bundleNames[path] || dirname(path).replace(/\//g, '-')
  const versionName = bundleVersionNames[name]
  if (!versionName) {
    return
  }

  const to = join(outDir, `${versionName}.css`)

  const result = await compiler(await readFile(from, 'utf8'), {
    from,
    to,
    map: { annotation: false },
  })

  await Promise.all([writeFile(to, result.css, 'utf8')])
})

console.log(`⚠️ VERSION: ${VERSION}`)
console.log(`⚠️ VERSION HASH: ${VERSION_HASH}`)

await Promise.all(tasks)
