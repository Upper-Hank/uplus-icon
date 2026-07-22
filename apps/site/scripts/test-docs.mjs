import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const siteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const rulesRoot = path.resolve(siteRoot, '../../docs/rules')
const expected = [
  ['principles', 1, 'foundations'],
  ['naming', 2, 'foundations'],
  ['canvas', 3, 'visual'],
  ['optical', 4, 'visual'],
  ['stroke', 5, 'visual'],
  ['svg', 6, 'visual'],
  ['metadata', 7, 'governance'],
  ['workflow', 8, 'governance'],
  ['api', 9, 'usage'],
  ['react', 10, 'usage'],
  ['web', 11, 'usage'],
  ['motion-api', 12, 'motion'],
  ['motion-authoring', 13, 'motion'],
  ['accessibility', 14, 'usage'],
  ['testing', 15, 'governance'],
  ['versioning', 16, 'governance'],
  ['contribution', 17, 'governance'],
  ['figma', 18, 'architecture'],
  ['package-architecture', 19, 'architecture'],
  ['release-process', 20, 'governance'],
]
const expectedBySlug = new Map(expected.map(([slug, order, group]) => [slug, { order, group }]))
const requiredFields = ['slug', 'order', 'group', 'title', 'description', 'locale']
const routes = new Set(['/docs', ...expected.slice(1).map(([slug]) => `/docs/${slug}`), '/docs/principles'])

function parse(source, filename) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
  assert(match, `${filename}: missing or invalid frontmatter`)
  const values = {}
  for (const line of match[1].split(/\r?\n/)) {
    const separator = line.indexOf(':')
    assert(separator > 0, `${filename}: malformed frontmatter line`)
    const key = line.slice(0, separator).trim()
    const value = line.slice(separator + 1).trim()
    assert(requiredFields.includes(key), `${filename}: unsupported frontmatter field ${key}`)
    assert(!(key in values), `${filename}: duplicate frontmatter field ${key}`)
    assert(value, `${filename}: empty frontmatter field ${key}`)
    values[key] = value
  }
  assert.deepEqual(Object.keys(values).sort(), [...requiredFields].sort(), `${filename}: incomplete frontmatter`)
  return { ...values, order: Number(values.order), body: match[2] }
}

const files = (await readdir(rulesRoot)).filter((file) => file.endsWith('.md')).sort()
assert.equal(files.length, expected.length * 2, `expected ${expected.length * 2} rule documents, found ${files.length}`)
const documents = []
for (const filename of files) {
  const source = await readFile(path.join(rulesRoot, filename), 'utf8')
  const document = parse(source, filename)
  const filenameMatch = filename.match(/^(\d{2})-([a-z-]+)\.(en|zh-CN)\.md$/)
  assert(filenameMatch, `${filename}: invalid filename`)
  assert.equal(Number(filenameMatch[1]), document.order, `${filename}: order does not match filename`)
  assert.equal(filenameMatch[2], document.slug, `${filename}: slug does not match filename`)
  assert.equal(filenameMatch[3], document.locale, `${filename}: locale does not match filename`)
  assert(expectedBySlug.has(document.slug), `${filename}: unknown slug`)
  assert.deepEqual(
    { order: document.order, group: document.group },
    expectedBySlug.get(document.slug),
    `${filename}: unexpected order or group`,
  )
  if (document.order <= 20 && !['api', 'react', 'web'].includes(document.slug)) {
    const normative = document.locale === 'zh-CN' ? /\*\*(必须|应该|可以|禁止)\*\*/ : /\*\*(MUST|SHOULD|MAY|MUST NOT)\*\*/
    assert(normative.test(document.body), `${filename}: core rule document has no normative level marker`)
  }
  documents.push({ filename, ...document })
}

const keys = new Set()
const orders = { en: new Set(), 'zh-CN': new Set() }
for (const document of documents) {
  const key = `${document.locale}:${document.slug}`
  assert(!keys.has(key), `${document.filename}: duplicate locale and slug`)
  keys.add(key)
  assert(!orders[document.locale].has(document.order), `${document.filename}: duplicate locale order`)
  orders[document.locale].add(document.order)

  for (const match of document.body.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    const target = match[1].split('#')[0]
    if (!target || /^(https?:|mailto:)/.test(target)) continue
    if (target.startsWith('/docs')) {
      assert(routes.has(target.replace(/\/$/, '') || '/docs'), `${document.filename}: invalid docs route ${target}`)
    } else if (target.endsWith('.md')) {
      assert(files.includes(path.basename(target)), `${document.filename}: missing linked document ${target}`)
    }
  }
}

for (const [slug, order, group] of expected) {
  const pair = documents.filter((document) => document.slug === slug)
  assert.equal(pair.length, 2, `${slug}: missing locale pair`)
  assert.deepEqual(pair.map(({ locale }) => locale).sort(), ['en', 'zh-CN'], `${slug}: invalid locales`)
  assert(pair.every((document) => document.order === order && document.group === group), `${slug}: locale metadata mismatch`)
}
assert.deepEqual([...orders.en].sort((a, b) => a - b), [...orders['zh-CN']].sort((a, b) => a - b), 'locale route order mismatch')

console.log(`Validated ${documents.length} documents, ${expected.length} routes, and all locale pairs.`)
