import type { SVGProps } from 'react'

export interface IconBaseProps extends Omit<SVGProps<SVGSVGElement>, 'strokeWidth'> {
  size?: number | string
  /** Relative visual weight from 0.5 to 2, or 0.5 to 8 CSS pixels with absoluteWeight and a numeric size. */
  weight?: number
  /** Interpret weight as CSS pixels for numeric sizes. String sizes use relative weight. */
  absoluteWeight?: boolean
  title?: string
}
