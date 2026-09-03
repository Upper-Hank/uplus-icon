/**
 * Rewrites the category and subgroup registries plus every icon's
 * classification from metadata/taxonomy.mjs.
 *
 * This overwrites committed metadata, so it previews by default. Run it after
 * editing taxonomy.mjs, then commit the diff; `npm run test:metadata` fails if
 * the committed JSON ever drifts from the taxonomy again.
 */
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildTaxonomyProjection, diffTaxonomyProjection } from './taxonomy-sync.mjs'

const sourceRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const metadataFile = join(sourceRoot, 'metadata', 'icons.json')
const categoriesFile = join(sourceRoot, 'metadata', 'categories.json')
const subgroupsFile = join(sourceRoot, 'metadata', 'subgroups.json')

const apply = process.argv.includes('--apply')
const metadata = JSON.parse(await readFile(metadataFile, 'utf8'))
const categories = JSON.parse(await readFile(categoriesFile, 'utf8'))
const subgroups = JSON.parse(await readFile(subgroupsFile, 'utf8'))

const differences = diffTaxonomyProjection(metadata, categories, subgroups)
if (differences.length === 0) {
  console.log(`Metadata already matches the Figma taxonomy for ${Object.keys(metadata).length} icons.`)
  process.exit(0)
}

console.log(`Pending taxonomy changes (${differences.length}):`)
for (const difference of differences) console.log(`  ${difference}`)

if (!apply) {
  console.log('\nPreview only. Re-run with --apply to write the taxonomy into metadata.')
  process.exit(0)
}

const projection = buildTaxonomyProjection(metadata)
for (const [sourceKey, classification] of projection.classification) {
  metadata[sourceKey] = { ...metadata[sourceKey], ...classification }
}

await writeFile(categoriesFile, `${JSON.stringify(projection.categories, null, 2)}\n`, 'utf8')
await writeFile(subgroupsFile, `${JSON.stringify(projection.subgroups, null, 2)}\n`, 'utf8')
await writeFile(metadataFile, `${JSON.stringify(metadata, null, 2)}\n`, 'utf8')

const counts = Object.fromEntries(projection.categories.map(({ id }) => [id, 0]))
for (const { categories: iconCategories } of Object.values(metadata)) counts[iconCategories[0]] += 1

console.log(`\nSynced ${projection.classification.size} icons to the Figma taxonomy with ${projection.subgroups.length} subgroups`)
console.log(counts)
