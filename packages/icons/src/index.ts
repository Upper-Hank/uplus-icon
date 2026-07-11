import { createIcon, type UplusIcon } from './createIcon'
import { Icon, type IconProps } from './Icon'
import { iconData, type IconName } from './generated/icons'

export { Icon, iconData }
export * from './generated/components'
export type { IconName, IconProps }
export type { UplusIcon }

export const icons = Object.fromEntries(
  iconData.map(({ name }) => [name, createIcon(name)]),
) as Record<IconName, UplusIcon>
