import type { IconCategoryId } from './generated/category-names.js'

export type IconId = `uicon_${string}`

export interface IconLegacyName {
  name: string
  renamedIn: string
}

export interface IconDefinition {
  id: IconId
  name: string
  viewBox: string
  body: string
}

export interface IconCategory {
  id: IconCategoryId
  title: string
  titleZh: string
  description: string
}

export interface IconSubgroup {
  id: string
  categoryId: IconCategoryId
  title: string
  titleZh: string
}

export interface LocalizedText {
  en: string
  zh: string
}

export interface IconMotionTransition {
  to: string
  name: string
}

export interface IconMotionCapabilities {
  semantic: readonly string[]
  transitions: readonly IconMotionTransition[]
}

export interface IconMeta {
  id: IconId
  name: string
  legacyNames?: readonly IconLegacyName[]
  componentName: string
  title: string
  titleZh: string
  categories: readonly IconCategoryId[]
  subgroup: string
  tags: readonly string[]
  aliases: readonly string[]
  description?: LocalizedText
  related?: readonly string[]
  variants?: readonly string[]
  parts?: readonly string[]
  motion?: IconMotionCapabilities
  contributors?: readonly string[]
  deprecated: boolean
  publishedIn: string | null
  updatedIn: string | null
  catalogOrder: number
}

export type PublicIconMeta = Omit<IconMeta, 'motion'>
