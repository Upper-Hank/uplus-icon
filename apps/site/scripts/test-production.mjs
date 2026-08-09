import assert from 'node:assert/strict'
import { readFile, readdir, stat } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const siteRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const publicRoot = join(siteRoot, 'public')
const distRoot = join(siteRoot, 'dist')
const index = await readFile(join(distRoot, 'index.html'), 'utf8')
const robots = await readFile(join(distRoot, 'robots.txt'), 'utf8')
const redirects = await readFile(join(distRoot, '_redirects'), 'utf8')
const sitemap = await readFile(join(distRoot, 'sitemap.xml'), 'utf8')

for (const marker of [
  'name="description"',
  'name="robots"',
  'property="og:title"',
  'property="og:description"',
  'property="og:url"',
  'rel="canonical"',
]) {
  assert(index.includes(marker), `Built index is missing ${marker}`)
}
assert.match(robots, /Sitemap: https:\/\/icon\.upper\.website\/sitemap\.xml/)
assert.equal(redirects.trim(), '/* /index.html 200')

const metadata = JSON.parse(await readFile(join(siteRoot, '..', '..', 'packages', 'icons', 'metadata', 'icons.json'), 'utf8'))
for (const path of ['/', '/icons', '/guide', '/docs', '/changelog', ...Object.keys(metadata).map((name) => `/icons/${name}`)]) {
  assert(sitemap.includes(`<loc>https://icon.upper.website${path}</loc>`), `Sitemap is missing ${path}`)
}
for (const path of ['/docs/motion-api', '/docs/motion-authoring']) {
  assert(!sitemap.includes(`<loc>https://icon.upper.website${path}</loc>`), `First release sitemap exposes ${path}`)
}

const sourceSitemap = await readFile(join(publicRoot, 'sitemap.xml'), 'utf8')
assert.equal(sitemap, sourceSitemap, 'Built sitemap differs from its generated source')

const assets = await readdir(join(distRoot, 'assets'))
const javascriptFiles = assets.filter((file) => file.endsWith('.js'))
assert(javascriptFiles.length >= 4, 'Site routes should produce separate JavaScript chunks')
const entryPath = index.match(/<script type="module"[^>]+src="\/assets\/([^"]+\.js)"/)?.[1]
assert(entryPath, 'Built index is missing its module entry')
const iconCount = Object.keys(metadata).length
const entryBudget = 120_000 + iconCount * 2_100
const entrySize = (await stat(join(distRoot, 'assets', entryPath))).size
assert(entrySize < entryBudget, `Initial JavaScript entry is ${entrySize} bytes and exceeds the ${entryBudget} byte budget for ${iconCount} icons`)
for (const file of javascriptFiles) {
  const source = await readFile(join(distRoot, 'assets', file), 'utf8')
  const size = (await stat(join(distRoot, 'assets', file))).size
  assert(size < 500_000, `${file} is ${size} bytes and exceeds the 500 kB production chunk limit`)
  for (const marker of ['Motion preview', '动画预览', 'motion-api', 'motion-authoring']) {
    assert(!source.includes(marker), `${file} exposes first-release Motion content: ${marker}`)
  }
}

console.log(`Verified production metadata, ${javascriptFiles.length} JavaScript chunks, sitemap, and SPA fallback`)
