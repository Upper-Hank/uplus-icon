import { iconDefinitions, legacyIconNameMap } from '@uplus-icon/core/dynamic'
import type { IconDefinition } from '@uplus-icon/core'

declare const process: {
  readonly env: {
    readonly NODE_ENV?: string
  }
}

const iconMap = new Map<string, IconDefinition>()
for (const icon of iconDefinitions) iconMap.set(icon.name, icon)
for (const [legacyName, info] of legacyIconNameMap.entries()) {
  const icon = iconMap.get(info.currentName)
  if (icon) iconMap.set(legacyName, icon)
}

const warnedLegacyNames = new Set<string>()
const warnedUnknownNames = new Set<string>()

export function resetLegacyNameWarningsForTests() {
  warnedLegacyNames.clear()
  warnedUnknownNames.clear()
}

const isDevelopment = () => process.env.NODE_ENV !== 'production'

export function resolveIconByName(name: string) {
  const legacy = legacyIconNameMap.get(name)
  if (legacy && isDevelopment() && !warnedLegacyNames.has(name)) {
    warnedLegacyNames.add(name)
    console.warn(
      `[uplus-icon] "${name}" was renamed to "${legacy.currentName}" in ${legacy.renamedIn}. Use <Icon name="${legacy.currentName}" />. Stable ID: ${legacy.id}.`,
    )
  }

  const icon = iconMap.get(name)
  if (!icon && isDevelopment() && !warnedUnknownNames.has(name)) {
    warnedUnknownNames.add(name)
    console.warn(`[uplus-icon] No icon is registered for "${name}", so nothing was rendered. Check the name against the published icon list.`)
  }
  return icon
}

export { iconMap }
