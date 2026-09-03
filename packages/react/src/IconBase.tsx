import type { IconDefinition } from '@uplus-icon/core'
import { applyIconWeight } from '@uplus-icon/core/internal/weight'
import { forwardRef } from 'react'
import type { IconBaseProps } from './types.js'

/**
 * Renders an icon definition as an SVG element.
 *
 * Caller props are spread before the computed attributes so the accessibility
 * contract cannot be broken by accident: an icon with an accessible name is
 * always exposed as `role="img"`, and an icon without one is always hidden from
 * assistive technology. Deliberately hook-free so named icons stay usable
 * inside React Server Components.
 */
export const IconBase = forwardRef<SVGSVGElement, IconBaseProps & { icon: IconDefinition }>(function IconBase(
  {
    icon,
    size = 24,
    weight = 2,
    absoluteWeight = false,
    title,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    role,
    width = size,
    height = size,
    ...props
  },
  ref,
) {
  const hasAccessibleName = Boolean(title || ariaLabel || ariaLabelledBy)
  const body = applyIconWeight(icon.body, { absoluteWeight, name: icon.name, size: width, weight })

  return (
    <svg
      {...props}
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={icon.viewBox}
      width={width}
      height={height}
      fill="none"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-hidden={hasAccessibleName ? undefined : true}
      role={hasAccessibleName ? role ?? 'img' : role}
    >
      {title ? <title>{title}</title> : null}
      <g dangerouslySetInnerHTML={{ __html: body }} />
    </svg>
  )
})

IconBase.displayName = 'IconBase'
