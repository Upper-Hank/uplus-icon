import type { SVGProps } from 'react'

export interface IconBaseProps extends Omit<SVGProps<SVGSVGElement>, 'strokeWidth'> {
  size?: number | string
  strokeWidth?: number
  /** Keep the rendered stroke width in CSS pixels instead of scaling it with `size`. */
  absoluteStrokeWidth?: boolean
  title?: string
}
