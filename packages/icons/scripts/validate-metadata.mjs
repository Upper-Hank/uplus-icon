const versionPattern = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/
const capabilityPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const genericMotionCapabilities = new Set(['blur', 'draw', 'fade', 'scale'])

export function validateMetadataReferences(metadata, iconNames) {
  const names = iconNames instanceof Set ? iconNames : new Set(iconNames)
  const aliasOwners = new Map()

  for (const [name, details] of Object.entries(metadata)) {
    if (details.deprecated !== undefined && typeof details.deprecated !== 'boolean') {
      throw new Error(`Metadata field ${name}.deprecated must be a boolean`)
    }

    for (const field of ['publishedIn', 'updatedIn']) {
      const version = details[field]
      if (version === undefined || version === null) continue
      if (typeof version !== 'string' || !versionPattern.test(version)) {
        throw new Error(`Metadata field ${name}.${field} must be a semantic version or null`)
      }
    }

    for (const alias of details.aliases) {
      if (names.has(alias)) throw new Error(`Metadata alias "${alias}" for ${name} conflicts with an icon name`)
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
    for (const field of ['generic', 'semantic']) {
      const capabilities = details.motion[field]
      if (new Set(capabilities).size !== capabilities.length) {
        throw new Error(`Metadata field ${name}.motion.${field} contains duplicate capabilities`)
      }
      if (capabilities.some((capability) => !capabilityPattern.test(capability))) {
        throw new Error(`Metadata field ${name}.motion.${field} capabilities must use kebab-case`)
      }
    }
    const unsupportedGeneric = details.motion.generic.filter((capability) => !genericMotionCapabilities.has(capability))
    if (unsupportedGeneric.length > 0) {
      throw new Error(`Metadata field ${name}.motion.generic contains unsupported capabilities: ${unsupportedGeneric.join(', ')}`)
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
