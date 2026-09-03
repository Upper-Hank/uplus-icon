import { categoryRegistry, figmaTaxonomy } from '../metadata/taxonomy.mjs'

export function buildCatalogOrderBySourceKey(metadata, sourceKeys = Object.keys(metadata)) {
  const orderBySourceKey = new Map()
  let index = 0

  for (const { id: categoryId } of categoryRegistry) {
    const groups = figmaTaxonomy[categoryId]
    if (!groups) throw new Error(`Missing taxonomy groups for category: ${categoryId}`)

    for (const icons of Object.values(groups)) {
      for (const sourceKey of icons) {
        if (!metadata[sourceKey]) throw new Error(`Catalog taxonomy references missing metadata: ${sourceKey}`)
        if (orderBySourceKey.has(sourceKey)) throw new Error(`Catalog taxonomy assigns ${sourceKey} more than once`)
        orderBySourceKey.set(sourceKey, index++)
      }
    }
  }

  const remaining = [...sourceKeys].filter((sourceKey) => !orderBySourceKey.has(sourceKey)).sort()
  for (const sourceKey of remaining) {
    orderBySourceKey.set(sourceKey, index++)
  }

  return orderBySourceKey
}
