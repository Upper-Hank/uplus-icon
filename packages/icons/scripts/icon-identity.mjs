import { randomUUID } from 'node:crypto'

export const ICON_ID_PATTERN = /^uicon_[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
export const VERSION_PATTERN = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*))*))?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/
const PUBLIC_NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function generateIconId() {
  return `uicon_${randomUUID()}`
}

export function isValidIconId(id) {
  return typeof id === 'string' && ICON_ID_PATTERN.test(id)
}

export function isValidPublicName(name) {
  return typeof name === 'string' && PUBLIC_NAME_PATTERN.test(name)
}

export function isValidSemver(version) {
  return typeof version === 'string' && VERSION_PATTERN.test(version)
}

export function parseSemver(version) {
  if (!isValidSemver(version)) return null
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/)
  if (!match) return null
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    prerelease: match[4]?.split('.') ?? [],
  }
}

function compareNumericIdentifiers(left, right) {
  if (left.length !== right.length) return left.length - right.length
  if (left === right) return 0
  return left < right ? -1 : 1
}

function comparePrereleaseIdentifiers(left, right) {
  const length = Math.max(left.length, right.length)
  for (let index = 0; index < length; index += 1) {
    const a = left[index]
    const b = right[index]
    if (a === undefined) return -1
    if (b === undefined) return 1
    if (a === b) continue

    const aIsNumeric = /^\d+$/.test(a)
    const bIsNumeric = /^\d+$/.test(b)
    if (aIsNumeric && bIsNumeric) return compareNumericIdentifiers(a, b)
    if (aIsNumeric) return -1
    if (bIsNumeric) return 1
    return a < b ? -1 : 1
  }
  return 0
}

export function compareSemver(left, right) {
  const a = parseSemver(left)
  const b = parseSemver(right)
  if (!a || !b) throw new Error(`Invalid semver comparison: ${left} vs ${right}`)
  for (const part of ['major', 'minor', 'patch']) {
    if (a[part] !== b[part]) return a[part] - b[part]
  }
  if (a.prerelease.length === 0 && b.prerelease.length === 0) return 0
  if (a.prerelease.length === 0) return 1
  if (b.prerelease.length === 0) return -1
  return comparePrereleaseIdentifiers(a.prerelease, b.prerelease)
}

export function manifestVersionFromFilename(filename) {
  return filename.endsWith('.json') ? filename.slice(0, -'.json'.length) : null
}

export function selectManifestVersion(manifestVersions, currentVersion, { includeCurrent = true } = {}) {
  return manifestVersions
    .filter((version) => {
      const comparison = compareSemver(version, currentVersion)
      return comparison < 0 || (includeCurrent && comparison === 0)
    })
    .sort(compareSemver)
    .at(-1) ?? null
}

export function selectPreviousManifestVersion(manifestVersions, currentVersion) {
  return selectManifestVersion(manifestVersions, currentVersion, { includeCurrent: false })
}

export function resolvePublicName(sourceKey, details) {
  if (typeof details.name === 'string' && details.name.trim()) return details.name
  return sourceKey
}

export function collectLegacyNames(details) {
  return details.legacyNames ?? []
}

export function validateIconIdentityMetadata(metadata) {
  const sourceKeys = Object.keys(metadata)
  const sourceKeySet = new Set(sourceKeys)
  const ids = new Map()
  const publicNames = new Map()

  for (const sourceKey of sourceKeys) {
    const details = metadata[sourceKey]
    const publicName = resolvePublicName(sourceKey, details)

    if (!isValidPublicName(publicName)) {
      throw new Error(`Metadata for ${sourceKey} has an invalid public name: ${publicName}`)
    }

    if (!details.id) {
      throw new Error(`Metadata for ${sourceKey} is missing id`)
    }
    if (!isValidIconId(details.id)) {
      throw new Error(`Metadata for ${sourceKey} has an invalid id: ${details.id}`)
    }

    const existingIdOwner = ids.get(details.id)
    if (existingIdOwner) throw new Error(`Duplicate icon id ${details.id} for ${existingIdOwner} and ${sourceKey}`)
    ids.set(details.id, sourceKey)

    const existingNameOwner = publicNames.get(publicName)
    if (existingNameOwner) throw new Error(`Duplicate public name "${publicName}" for ${existingNameOwner} and ${sourceKey}`)
    publicNames.set(publicName, sourceKey)

    if (publicName !== sourceKey && !collectLegacyNames(details).some((entry) => entry.name === sourceKey)) {
      throw new Error(`Metadata for ${sourceKey} renamed to "${publicName}" without recording "${sourceKey}" in legacyNames`)
    }
  }

  const legacyNames = new Map()
  const allLegacyNames = new Set()
  for (const sourceKey of sourceKeys) {
    for (const legacy of collectLegacyNames(metadata[sourceKey])) {
      allLegacyNames.add(legacy.name)
    }
  }

  for (const sourceKey of sourceKeys) {
    const details = metadata[sourceKey]
    const publicName = resolvePublicName(sourceKey, details)

    for (const legacy of collectLegacyNames(details)) {
      if (!legacy || typeof legacy !== 'object') {
        throw new Error(`Metadata for ${sourceKey} has an invalid legacyNames entry`)
      }
      if (!isValidPublicName(legacy.name)) {
        throw new Error(`Metadata for ${sourceKey} has an invalid legacy name: ${legacy.name}`)
      }
      if (!isValidSemver(legacy.renamedIn)) {
        throw new Error(`Metadata for ${sourceKey} legacy name "${legacy.name}" has an invalid renamedIn version: ${legacy.renamedIn}`)
      }
      if (legacy.name === publicName) {
        throw new Error(`Metadata for ${sourceKey} legacy name "${legacy.name}" must not equal the current public name`)
      }
      if (sourceKeySet.has(legacy.name) && legacy.name !== sourceKey) {
        throw new Error(`Metadata legacy name "${legacy.name}" for ${sourceKey} conflicts with a source key`)
      }
      const existingLegacyOwner = legacyNames.get(legacy.name)
      if (existingLegacyOwner) {
        throw new Error(`Metadata legacy name "${legacy.name}" belongs to both ${existingLegacyOwner} and ${sourceKey}`)
      }
      const currentNameOwner = publicNames.get(legacy.name)
      if (currentNameOwner) {
        throw new Error(`Metadata legacy name "${legacy.name}" for ${sourceKey} conflicts with current public name of ${currentNameOwner}`)
      }
      legacyNames.set(legacy.name, sourceKey)
    }

    for (const alias of details.aliases ?? []) {
      if (publicNames.has(alias)) throw new Error(`Metadata alias "${alias}" for ${sourceKey} conflicts with a current public name`)
      if (allLegacyNames.has(alias)) throw new Error(`Metadata alias "${alias}" for ${sourceKey} conflicts with a legacy public name`)
    }
  }

  return {
    sourceKeySet,
    publicNameBySourceKey: new Map(sourceKeys.map((sourceKey) => [sourceKey, resolvePublicName(sourceKey, metadata[sourceKey])])),
    sourceKeyByPublicName: new Map(sourceKeys.map((sourceKey) => [resolvePublicName(sourceKey, metadata[sourceKey]), sourceKey])),
  }
}

export function resolvePublicReference(targetSourceKey, publicNameBySourceKey) {
  const publicName = publicNameBySourceKey.get(targetSourceKey)
  if (!publicName) throw new Error(`Metadata references missing icon "${targetSourceKey}"`)
  return publicName
}

export function buildLegacyNameEntries(metadata) {
  const entries = []
  for (const [sourceKey, details] of Object.entries(metadata)) {
    const publicName = resolvePublicName(sourceKey, details)
    for (const legacy of collectLegacyNames(details)) {
      entries.push({
        legacyName: legacy.name,
        currentName: publicName,
        renamedIn: legacy.renamedIn,
        id: details.id,
        sourceKey,
      })
    }
  }
  entries.sort((left, right) => left.legacyName.localeCompare(right.legacyName))
  return entries
}
