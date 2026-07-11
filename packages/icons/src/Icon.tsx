import { forwardRef, type SVGProps } from 'react'
import { iconData, type IconName } from './generated/icons'

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName
  size?: number | string
  title?: string
}

const iconMap = new Map(iconData.map((icon) => [icon.name, icon]))

export const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon(
  { name, size = 24, title, 'aria-label': ariaLabel, ...props },
  ref,
) {
  const icon = iconMap.get(name)
  if (!icon) return null

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
