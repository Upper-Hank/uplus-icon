import { readFile, readdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const siteRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const workspaceRoot = dirname(dirname(siteRoot))
const metadata = JSON.parse(await readFile(join(workspaceRoot, 'packages', 'icons', 'metadata', 'icons.json'), 'utf8'))
const rules = await readdir(join(workspaceRoot, 'docs', 'rules'))
const docSlugs = rules.sort()
  .map((file) => file.match(/^\d{2}-([a-z-]+)\.en\.md$/)?.[1])
  .filter(Boolean)
  .filter((slug) => slug !== 'principles')

const paths = [
  '/',
  '/icons',
  '/guide',
  '/docs',
  '/changelog',
  ...docSlugs.map((slug) => `/docs/${slug}`),
  ...Object.keys(metadata).sort().map((name) => `/icons/${name}`),
]

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...paths.map((path) => `  <url><loc>https://icon.upper.website${path}</loc></url>`),
  '</urlset>',
  '',
].join('\n')

await writeFile(join(siteRoot, 'public', 'sitemap.xml'), sitemap)
console.log(`Generated sitemap with ${paths.length} canonical routes`)
