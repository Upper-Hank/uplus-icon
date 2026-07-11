import { forwardRef } from 'react'
import type { IconBaseProps, IconDefinition } from './types.js'

export const IconBase = forwardRef<SVGSVGElement, IconBaseProps & { icon: IconDefinition }>(function IconBase(
  { icon, size = 24, title, 'aria-label': ariaLabel, ...props },
  ref,
) {
  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={icon.viewBox}
      width={size}
      height={size}
      fill="none"
      aria-hidden={title || ariaLabel ? undefined : true}
      aria-label={ariaLabel}
      role={title || ariaLabel ? 'img' : undefined}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <g dangerouslySetInnerHTML={{ __html: icon.body }} />
    </svg>
  )
})
