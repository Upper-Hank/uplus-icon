import type { SVGProps } from 'react'

export interface IconBaseProps extends Omit<SVGProps<SVGSVGElement>, 'strokeWidth'> {
  size?: number | string
  /** Visual weight from 0.5 to 2. Defaults to the 2-unit design master. */
  weight?: number
  /** Keep weight in CSS pixels for numeric sizes. String sizes use relative weight. */
  absoluteWeight?: boolean
  title?: string
}
