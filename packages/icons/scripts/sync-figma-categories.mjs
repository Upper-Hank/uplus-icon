import { readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { categoryRegistry, figmaTaxonomy, subgroupLabels } from '../metadata/taxonomy.mjs'

const sourceRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const metadataFile = join(sourceRoot, 'metadata', 'icons.json')
const categoriesFile = join(sourceRoot, 'metadata', 'categories.json')
const subgroupsFile = join(sourceRoot, 'metadata', 'subgroups.json')

const assignments = new Map()
const subgroupRegistry = []

for (const [categoryId, groups] of Object.entries(figmaTaxonomy)) {
  for (const [groupId, icons] of Object.entries(groups)) {
    const [title, titleZh] = subgroupLabels[groupId] ?? [groupId, groupId]
    subgroupRegistry.push({ id: groupId, categoryId, title, titleZh })
    for (const icon of icons) {
      if (assignments.has(icon)) throw new Error(`Duplicate Figma assignment for ${icon}`)
      assignments.set(icon, { categoryId, groupId })
    }
  }
}

const metadata = JSON.parse(await readFile(metadataFile, 'utf8'))
const iconNames = Object.keys(metadata).sort()

for (const name of iconNames) {
  const assignment = assignments.get(name)
  if (!assignment) throw new Error(`Missing Figma category for ${name}`)
  const details = metadata[name]
  const { categoryId, groupId } = assignment
  const categoryMeta = categoryRegistry.find((entry) => entry.id === categoryId)
  const subgroupMeta = subgroupRegistry.find((entry) => entry.id === groupId && entry.categoryId === categoryId)
  if (!categoryMeta) throw new Error(`Missing category registry for ${categoryId}`)
  if (!subgroupMeta) throw new Error(`Missing subgroup registry for ${categoryId}/${groupId}`)
  const tags = [...new Set([
    categoryMeta.id,
    categoryMeta.title.toLowerCase(),
    categoryMeta.titleZh,
    subgroupMeta.id,
    subgroupMeta.title.toLowerCase(),
    subgroupMeta.titleZh,
  ])]

  metadata[name] = {
    ...details,
    categories: [categoryId],
    subgroup: groupId,
    tags,
  }
}

const unassigned = [...assignments.keys()].filter((name) => !(name in metadata))
if (unassigned.length > 0) throw new Error(`Figma taxonomy references missing metadata: ${unassigned.join(', ')}`)

await writeFile(categoriesFile, `${JSON.stringify(categoryRegistry, null, 2)}\n`, 'utf8')
await writeFile(subgroupsFile, `${JSON.stringify(subgroupRegistry, null, 2)}\n`, 'utf8')
await writeFile(metadataFile, `${JSON.stringify(metadata, null, 2)}\n`, 'utf8')

const counts = Object.fromEntries(categoryRegistry.map(({ id }) => [id, 0]))
for (const { categories } of Object.values(metadata)) counts[categories[0]] += 1

console.log(`Synced ${iconNames.length} icons to Figma taxonomy with ${subgroupRegistry.length} subgroups`)
console.log(counts)
