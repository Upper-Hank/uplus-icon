import type { SVGProps } from 'react'

export interface IconDefinition {
  name: string
  viewBox: string
  body: string
}

export interface IconMeta {
  name: string
  componentName: string
  title: string
  titleZh: string
  categories: readonly string[]
  tags: readonly string[]
  aliases: readonly string[]
  deprecated: boolean
  publishedIn: string | null
  updatedIn: string | null
}

export interface IconBaseProps extends SVGProps<SVGSVGElement> {
  size?: number | string
  title?: string
}
