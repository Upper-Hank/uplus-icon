import type { IconDefinition } from '@uplus-icon/core'
import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import { IconBase } from './IconBase.js'

export function createIcon(icon: IconDefinition) {
  const Component = forwardRef<SVGSVGElement, Omit<ComponentPropsWithoutRef<typeof IconBase>, 'icon'>>(
    function UplusIcon(props, ref) {
      return <IconBase ref={ref} icon={icon} {...props} />
    },
  )
  Component.displayName = `${icon.name.split('-').map((part) => part[0].toUpperCase() + part.slice(1)).join('')}Icon`
  return Component
}

export type UplusIcon = ReturnType<typeof createIcon>
