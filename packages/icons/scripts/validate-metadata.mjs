import { isValidSemver, validateIconIdentityMetadata } from './icon-identity.mjs'

const capabilityPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function validateMetadataReferences(metadata, iconNames, publicNameBySourceKey = null) {
  const names = iconNames instanceof Set ? iconNames : new Set(iconNames)
  const resolvedPublicNames = publicNameBySourceKey ?? new Map(
    [...names].map((sourceKey) => [sourceKey, metadata[sourceKey]?.name ?? sourceKey]),
  )
  const publicNames = new Set(resolvedPublicNames.values())
  const allLegacyNames = new Set()
  const aliasOwners = new Map()

  for (const details of Object.values(metadata)) {
    for (const legacy of details.legacyNames ?? []) {
      allLegacyNames.add(legacy.name)
    }
  }

  for (const [name, details] of Object.entries(metadata)) {
    if (details.deprecated !== undefined && typeof details.deprecated !== 'boolean') {
      throw new Error(`Metadata field ${name}.deprecated must be a boolean`)
    }

    for (const field of ['publishedIn', 'updatedIn']) {
      const version = details[field]
      if (version === undefined || version === null) continue
      if (!isValidSemver(version)) {
        throw new Error(`Metadata field ${name}.${field} must be a semantic version or null`)
      }
    }

    for (const alias of details.aliases) {
      if (names.has(alias)) throw new Error(`Metadata alias "${alias}" for ${name} conflicts with a source key`)
      if (publicNames.has(alias)) throw new Error(`Metadata alias "${alias}" for ${name} conflicts with a current public name`)
      if (allLegacyNames.has(alias)) throw new Error(`Metadata alias "${alias}" for ${name} conflicts with a legacy public name`)
      const owner = aliasOwners.get(alias)
      if (owner) throw new Error(`Metadata alias "${alias}" belongs to both ${owner} and ${name}`)
      aliasOwners.set(alias, name)
    }

    for (const field of ['related', 'variants']) {
      for (const target of details[field] ?? []) {
        if (!names.has(target)) throw new Error(`Metadata field ${name}.${field} references missing icon "${target}"`)
        if (target === name) throw new Error(`Metadata field ${name}.${field} must not reference itself`)
      }
    }

    if (details.motion === undefined) continue
    for (const field of ['semantic']) {
      const capabilities = details.motion[field]
      if (new Set(capabilities).size !== capabilities.length) {
        throw new Error(`Metadata field ${name}.motion.${field} contains duplicate capabilities`)
      }
      if (capabilities.some((capability) => !capabilityPattern.test(capability))) {
        throw new Error(`Metadata field ${name}.motion.${field} capabilities must use kebab-case`)
      }
    }
    const transitionKeys = new Set()
    for (const transition of details.motion.transitions) {
      if (!capabilityPattern.test(transition.name)) {
        throw new Error(`Metadata field ${name}.motion.transitions names must use kebab-case`)
      }
      if (!names.has(transition.to)) {
        throw new Error(`Metadata field ${name}.motion.transitions references missing icon "${transition.to}"`)
      }
      if (transition.to === name) {
        throw new Error(`Metadata field ${name}.motion.transitions must target another icon`)
      }
      const key = `${transition.to}\0${transition.name}`
      if (transitionKeys.has(key)) {
        throw new Error(`Metadata field ${name}.motion.transitions contains duplicate transition to "${transition.to}"`)
      }
      transitionKeys.add(key)
    }
  }
}

export { validateIconIdentityMetadata }
