export interface IconOptions {
  size?: number | string
  strokeWidth?: number
  /** Keep the rendered stroke width in CSS pixels instead of scaling it with `size`. */
  absoluteStrokeWidth?: boolean
  title?: string
  ariaLabel?: string
  className?: string
  attributes?: Readonly<Record<string, string | number | boolean | null | undefined>>
}
