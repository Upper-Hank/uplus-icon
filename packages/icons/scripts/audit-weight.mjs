import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { solidPathAnchors } from '../../core/dist/weight.js'

const sourceRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const rawDir = join(sourceRoot, 'raw')
const autoElements = new Set(['circle', 'ellipse', 'rect'])
const reviewedComplexFillCounts = new Map([
  ['dial.svg', 1],
  ['gender-male.svg', 1],
  ['gender-transgender.svg', 1],
])
// Derived from the runtime registry so the audit and the renderer cannot drift.
const anchoredPathCounts = new Map(
  Object.entries(solidPathAnchors).map(([name, anchors]) => [`${name}.svg`, anchors.length]),
)

const files = (await readdir(rawDir)).filter((file) => file.endsWith('.svg')).sort()
const auto = []
const review = []
const anchored = []

for (const file of files) {
  const source = await readFile(join(rawDir, file), 'utf8')
  for (const match of source.matchAll(/<(path|circle|ellipse|rect|line|polyline|polygon)\b([^>]*)>/g)) {
    const [, element, attributes] = match
    if (!/\bfill\s*=\s*(["'])black\1/.test(attributes)) continue
    const entry = { file, element }
    if (autoElements.has(element)) auto.push(entry)
    else if (anchoredPathCounts.has(file)) anchored.push(entry)
    else review.push(entry)
  }
}

const actualReviewCounts = new Map()
for (const { file } of review) actualReviewCounts.set(file, (actualReviewCounts.get(file) ?? 0) + 1)
assert.deepEqual(actualReviewCounts, reviewedComplexFillCounts, 'Complex solid geometry changed; review the weight audit before release')
const actualAnchoredCounts = new Map()
for (const { file } of anchored) actualAnchoredCounts.set(file, (actualAnchoredCounts.get(file) ?? 0) + 1)
assert.deepEqual(actualAnchoredCounts, anchoredPathCounts, 'Anchored solid geometry changed; review the explicit weight rule')

console.log(`Weight audit checked ${files.length} icons: ${auto.length} solid primitives can scale automatically.`)
console.log(`Approved anchored path rule: ${anchored.map(({ file, element }) => `${file} <${element}>`).join(', ')}`)
console.log(`Complex solid geometry remains unchanged and requires design review: ${review.map(({ file, element }) => `${file} <${element}>`).join(', ')}`)
