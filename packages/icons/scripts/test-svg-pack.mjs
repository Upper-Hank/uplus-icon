import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { createPublishedSvg, createSvgPackReadme } from './published-svg.mjs'
import { createZip, unzip } from './zip.mjs'

const sourceRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const workspaceRoot = dirname(dirname(sourceRoot))
const zipPath = join(workspaceRoot, 'apps', 'site', 'public', 'downloads', 'uplus-icons.svg.zip')
const metadata = JSON.parse(await readFile(join(sourceRoot, 'metadata', 'icons.json'), 'utf8'))
const reactPackage = JSON.parse(await readFile(join(workspaceRoot, 'packages', 'react', 'package.json'), 'utf8'))
const publicNames = [...new Set(Object.values(metadata).map((icon) => icon.name))].sort()

test('zip helper round-trips utf8 entries deterministically', () => {
  const entries = [
    { name: 'README.txt', data: 'hello\n' },
    { name: 'arrow-left.svg', data: '<svg></svg>\n' },
  ]
  const first = createZip(entries)
  const second = createZip(entries)
  assert.equal(Buffer.compare(first, second), 0)
  const files = unzip(first)
  assert.equal(files.get('README.txt').toString('utf8'), 'hello\n')
  assert.equal(files.get('arrow-left.svg').toString('utf8'), '<svg></svg>\n')
})

test('published SVG pack matches public names and release definitions', async () => {
  const archive = await readFile(zipPath)
  const files = unzip(archive)
  const names = [...files.keys()].sort()
  const definitionsSource = await readFile(join(workspaceRoot, 'packages', 'core', 'src', 'generated', 'definitions.ts'), 'utf8')
  const jsonStart = definitionsSource.indexOf('= [')
  const definitions = JSON.parse(definitionsSource.slice(jsonStart + 2, definitionsSource.lastIndexOf(']') + 1))
  const definitionsByName = new Map(definitions.map((icon) => [icon.name, icon]))

  assert.deepEqual(names, ['LICENSE', 'README.txt', ...publicNames.map((name) => `${name}.svg`)].sort())
  assert.equal(definitions.length, publicNames.length)
  assert.equal(files.get('LICENSE').toString('utf8'), await readFile(join(workspaceRoot, 'LICENSE'), 'utf8'))
  assert.equal(files.get('README.txt').toString('utf8'), createSvgPackReadme(reactPackage.version))

  for (const name of publicNames) {
    const definition = definitionsByName.get(name)
    assert.ok(definition, `${name} is missing from generated definitions`)
    const svg = files.get(`${name}.svg`).toString('utf8')
    assert.equal(svg, createPublishedSvg(definition))
    assert.match(svg, /currentColor/)
    assert.doesNotMatch(svg, /="black"/)
  }
})
