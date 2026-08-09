export interface IconOptions {
  size?: number | string
  /** Visual weight from 0.5 to 2. Defaults to the 2-unit design master. */
  weight?: number
  /** Keep weight in CSS pixels for numeric sizes. String sizes use relative weight. */
  absoluteWeight?: boolean
  title?: string
  ariaLabel?: string
  className?: string
  attributes?: Readonly<Record<string, string | number | boolean | null | undefined>>
}
