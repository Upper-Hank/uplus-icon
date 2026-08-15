export type DocLocale = 'en' | 'zh-CN'
export type DocGroup = 'foundations' | 'visual' | 'architecture' | 'governance' | 'usage'
export type DocSlug =
  | 'principles'
  | 'naming'
  | 'canvas'
  | 'optical'
  | 'stroke'
  | 'svg'
  | 'metadata'
  | 'workflow'
  | 'api'
  | 'react'
  | 'accessibility'
  | 'testing'
  | 'versioning'
  | 'contribution'
  | 'figma'
  | 'package-architecture'
  | 'release-process'
  | 'identity'

export interface DocHeading {
  depth: 2 | 3
  id: string
  label: string
}

export interface DocDocument {
  slug: DocSlug
  order: number
  group: DocGroup
  title: string
  description: string
  locale: DocLocale
  body: string
  headings: DocHeading[]
}

const groupLabels = {
  en: { foundations: 'Foundations', visual: 'Visual rules', architecture: 'Architecture', governance: 'Governance', usage: 'Usage' },
  zh: { foundations: '基础', visual: '视觉规则', architecture: '架构', governance: '治理', usage: '使用' },
} satisfies Record<'en' | 'zh', Record<DocGroup, string>>

export function getDocGroupLabels(language: 'en' | 'zh') {
  return groupLabels[language]
}

const rawDocuments = import.meta.glob([
  '../../../../docs/rules/*.md',
  '!../../../../docs/rules/12-motion-api.*.md',
  '!../../../../docs/rules/13-motion-authoring.*.md',
], {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

const requiredFields = ['slug', 'order', 'group', 'title', 'description', 'locale'] as const
const slugs: DocSlug[] = ['principles', 'naming', 'canvas', 'optical', 'stroke', 'svg', 'metadata', 'workflow', 'api', 'react', 'accessibility', 'testing', 'versioning', 'contribution', 'figma', 'package-architecture', 'release-process', 'identity']
const groups: DocGroup[] = ['foundations', 'visual', 'architecture', 'governance', 'usage']

function parseDocument(source: string, path: string): DocDocument {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
  if (!match) throw new Error(`Invalid frontmatter in ${path}`)

  const values: Record<string, string> = {}
  for (const line of match[1].split(/\r?\n/)) {
    const separator = line.indexOf(':')
    if (separator < 1) throw new Error(`Invalid frontmatter line in ${path}: ${line}`)
    const key = line.slice(0, separator).trim()
    const value = line.slice(separator + 1).trim()
    if (!requiredFields.includes(key as (typeof requiredFields)[number]) || key in values || !value) {
      throw new Error(`Invalid frontmatter field in ${path}: ${key}`)
    }
    values[key] = value
  }
  if (Object.keys(values).length !== requiredFields.length || requiredFields.some((field) => !values[field])) {
    throw new Error(`Incomplete frontmatter in ${path}`)
  }

  const order = Number(values.order)
  if (!slugs.includes(values.slug as DocSlug) || !groups.includes(values.group as DocGroup)) {
    throw new Error(`Unknown slug or group in ${path}`)
  }
  if (values.locale !== 'en' && values.locale !== 'zh-CN') throw new Error(`Unknown locale in ${path}`)
  if (!Number.isInteger(order) || order < 1) throw new Error(`Invalid order in ${path}`)

  const body = match[2].trim()
  return {
    slug: values.slug as DocSlug,
    order,
    group: values.group as DocGroup,
    title: values.title,
    description: values.description,
    locale: values.locale,
    body,
    headings: extractHeadings(body),
  }
}

export function headingId(label: string) {
  return label
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[：:]/g, '-')
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, '')
    .trim()
    .toLocaleLowerCase()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function extractHeadings(body: string): DocHeading[] {
  const counts = new Map<string, number>()
  const headings: DocHeading[] = []
  let inCode = false

  for (const line of body.split(/\r?\n/)) {
    if (line.trimStart().startsWith('```')) {
      inCode = !inCode
      continue
    }
    if (inCode) continue
    const match = line.match(/^(##|###)\s+(.+?)\s*#*$/)
    if (!match) continue
    const label = match[2].replace(/[*_~]/g, '').trim()
    const base = headingId(label)
    const count = counts.get(base) ?? 0
    counts.set(base, count + 1)
    headings.push({ depth: match[1].length as 2 | 3, id: count ? `${base}-${count}` : base, label })
  }
  return headings
}

const documents = Object.entries(rawDocuments).map(([path, source]) => parseDocument(source, path))

function validateDocuments() {
  const keys = new Set<string>()
  for (const document of documents) {
    const key = `${document.locale}:${document.slug}`
    if (keys.has(key)) throw new Error(`Duplicate document: ${key}`)
    keys.add(key)
  }

  for (const slug of slugs) {
    const english = documents.find((document) => document.slug === slug && document.locale === 'en')
    const chinese = documents.find((document) => document.slug === slug && document.locale === 'zh-CN')
    if (!english || !chinese) throw new Error(`Missing locale pair for ${slug}`)
    if (english.order !== chinese.order || english.group !== chinese.group) {
      throw new Error(`Locale metadata mismatch for ${slug}`)
    }
  }
  if (documents.length !== slugs.length * 2) throw new Error(`Expected ${slugs.length * 2} documents, found ${documents.length}`)
}

validateDocuments()

export function getDocuments(language: 'en' | 'zh') {
  const locale: DocLocale = language === 'zh' ? 'zh-CN' : 'en'
  return documents.filter((document) => document.locale === locale).sort((a, b) => a.order - b.order)
}

export function getDocument(slug: DocSlug, language: 'en' | 'zh') {
  const document = getDocuments(language).find((item) => item.slug === slug)
  if (!document) throw new Error(`Document not found: ${language}/${slug}`)
  return document
}

export function getDocPath(slug: DocSlug) {
  return slug === 'principles' ? '/docs' : `/docs/${slug}`
}
