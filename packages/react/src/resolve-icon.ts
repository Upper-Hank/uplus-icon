import { iconDefinitions, legacyIconNameMap } from '@uplus-icon/core/dynamic'
import type { IconDefinition } from '@uplus-icon/core'

const iconMap = new Map<string, IconDefinition>()
for (const icon of iconDefinitions) iconMap.set(icon.name, icon)
for (const [legacyName, info] of legacyIconNameMap.entries()) {
  const icon = iconMap.get(info.currentName)
  if (icon) iconMap.set(legacyName, icon)
}

const warnedLegacyNames = new Set<string>()

export function resetLegacyNameWarningsForTests() {
  warnedLegacyNames.clear()
}

export function resolveIconByName(name: string) {
  const legacy = legacyIconNameMap.get(name)
  if (legacy && process.env.NODE_ENV !== 'production' && !warnedLegacyNames.has(name)) {
    warnedLegacyNames.add(name)
    console.warn(
      `[uplus-icon] "${name}" was renamed to "${legacy.currentName}" in ${legacy.renamedIn}. Use <Icon name="${legacy.currentName}" />. Stable ID: ${legacy.id}.`,
    )
  }
  return iconMap.get(name)
}

export { iconMap }
