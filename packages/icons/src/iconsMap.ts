import { createIcon, type UplusIcon } from './createIcon.js'
import { iconDefinitions } from './generated/definitions.js'
import type { IconName } from './generated/names.js'

export const icons = Object.fromEntries(
  iconDefinitions.map((icon) => [icon.name, createIcon(icon)]),
) as Record<IconName, UplusIcon>
