import type { ReactNode } from 'react'

export function UiIconSlot({ children, name }: { children?: ReactNode; name: string }) {
  return (
    <span className={`ui-icon-slot${children ? '' : ' is-placeholder'}`} data-icon-slot={name} aria-hidden="true">
      {children}
    </span>
  )
}
