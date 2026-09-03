import { categoryRegistry, figmaTaxonomy, subgroupLabels } from '../metadata/taxonomy.mjs'

/**
 * Derives the category registry, subgroup registry, and per-icon classification
 * that metadata/taxonomy.mjs implies. Both the sync tool and the CI guard use
 * this so the registries can never silently drift from the taxonomy.
 */
export function buildTaxonomyProjection(metadata) {
  const assignments = new Map()
  const subgroups = []

  for (const [categoryId, groups] of Object.entries(figmaTaxonomy)) {
    for (const [groupId, icons] of Object.entries(groups)) {
      const [title, titleZh] = subgroupLabels[groupId] ?? [groupId, groupId]
      subgroups.push({ id: groupId, categoryId, title, titleZh })
      for (const icon of icons) {
        if (assignments.has(icon)) throw new Error(`Duplicate Figma assignment for ${icon}`)
        assignments.set(icon, { categoryId, groupId })
      }
    }
  }

  const sourceKeys = Object.keys(metadata).sort()
  const classification = new Map()

  for (const sourceKey of sourceKeys) {
    const assignment = assignments.get(sourceKey)
    if (!assignment) throw new Error(`Missing Figma category for ${sourceKey}`)
    const { categoryId, groupId } = assignment
    const category = categoryRegistry.find((entry) => entry.id === categoryId)
    const subgroup = subgroups.find((entry) => entry.id === groupId && entry.categoryId === categoryId)
    if (!category) throw new Error(`Missing category registry for ${categoryId}`)
    if (!subgroup) throw new Error(`Missing subgroup registry for ${categoryId}/${groupId}`)

    classification.set(sourceKey, {
      categories: [categoryId],
      subgroup: groupId,
      tags: [...new Set([
        category.id,
        category.title.toLowerCase(),
        category.titleZh,
        subgroup.id,
        subgroup.title.toLowerCase(),
        subgroup.titleZh,
      ])],
    })
  }

  const unassigned = [...assignments.keys()].filter((sourceKey) => !(sourceKey in metadata))
  if (unassigned.length > 0) throw new Error(`Figma taxonomy references missing metadata: ${unassigned.join(', ')}`)

  return { categories: categoryRegistry, classification, subgroups }
}

/**
 * Returns human-readable descriptions of every place the committed metadata
 * disagrees with the taxonomy projection. An empty array means they are in sync.
 */
export function diffTaxonomyProjection(metadata, categories, subgroups) {
  const projection = buildTaxonomyProjection(metadata)
  const differences = []
  const sameJson = (left, right) => JSON.stringify(left) === JSON.stringify(right)

  if (!sameJson(categories, projection.categories)) differences.push('categories.json does not match taxonomy.mjs categoryRegistry')
  if (!sameJson(subgroups, projection.subgroups)) differences.push('subgroups.json does not match the taxonomy.mjs subgroup registry')

  for (const [sourceKey, expected] of projection.classification) {
    const details = metadata[sourceKey]
    for (const field of ['categories', 'subgroup', 'tags']) {
      if (!sameJson(details[field], expected[field])) {
        differences.push(`icons.json ${sourceKey}.${field} does not match taxonomy.mjs`)
      }
    }
  }

  return differences
}
