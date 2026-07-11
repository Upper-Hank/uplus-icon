import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import { Icon } from './Icon'
import type { IconName } from './generated/icons'

export function createIcon(name: IconName) {
  const Component = forwardRef<SVGSVGElement, Omit<ComponentPropsWithoutRef<typeof Icon>, 'name'>>(
    function UplusIcon(props, ref) {
      return <Icon ref={ref} name={name} {...props} />
    },
  )
  Component.displayName = `${name.split('-').map((part) => part[0].toUpperCase() + part.slice(1)).join('')}Icon`
  return Component
}

export type UplusIcon = ReturnType<typeof createIcon>
