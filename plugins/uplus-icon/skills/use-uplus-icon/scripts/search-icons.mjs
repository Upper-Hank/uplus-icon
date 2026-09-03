#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import { isAbsolute, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const FIELD_WEIGHTS = Object.freeze({
  name: 120,
  componentName: 115,
  aliases: 110,
  legacyNames: 108,
  title: 105,
  titleZh: 105,
  tags: 90,
  categories: 70,
  subgroup: 65,
  description: 60,
  related: 45,
  variants: 45,
})

export function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFKC')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .toLocaleLowerCase('en-US')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
}

function textValues(icon) {
  const description = icon.description ? [icon.description.en, icon.description.zh] : []
  return {
    name: [icon.name],
    componentName: [icon.componentName],
    aliases: icon.aliases ?? [],
    legacyNames: (icon.legacyNames ?? []).map((legacy) => legacy.name),
    title: [icon.title],
    titleZh: [icon.titleZh],
    tags: icon.tags ?? [],
    categories: icon.categories ?? [],
    subgroup: [icon.subgroup],
    description,
    related: icon.related ?? [],
    variants: icon.variants ?? [],
  }
}

function matchValue(normalizedQuery, queryTokens, value) {
  const normalizedValue = normalizeText(value)
  if (!normalizedValue) return null

  const valueTokens = normalizedValue.split(' ')
  const compactValue = valueTokens.join('')
  const compactQuery = queryTokens.join('')
  const matchedTokens = queryTokens.filter((token) => (
    valueTokens.includes(token) || normalizedValue.includes(token) || compactValue.includes(token)
  ))

  if (normalizedValue === normalizedQuery || compactValue === compactQuery) {
    return { exact: true, matchedTokens }
  }
  if (matchedTokens.length > 0) return { exact: false, matchedTokens }
  return null
}

export function rankIcons(iconMeta, query, options = {}) {
  const normalizedQuery = normalizeText(query)
  if (!normalizedQuery) throw new Error('Search query must not be empty.')

  const queryTokens = [...new Set(normalizedQuery.split(' '))]
  const includeDeprecated = options.includeDeprecated === true
  const limit = Number.isInteger(options.limit) && options.limit > 0 ? options.limit : 8
  const results = []

  for (const icon of iconMeta) {
    if (!includeDeprecated && icon.deprecated) continue

    let score = 0
    const tokenMatches = new Set()
    const matchedBy = []

    for (const [field, values] of Object.entries(textValues(icon))) {
      const weight = FIELD_WEIGHTS[field]
      for (const value of values.filter(Boolean)) {
        const match = matchValue(normalizedQuery, queryTokens, value)
        if (!match) continue

        for (const token of match.matchedTokens) tokenMatches.add(token)
        const contribution = match.exact
          ? weight
          : Math.max(1, Math.round(weight * match.matchedTokens.length / queryTokens.length * 0.55))
        score += contribution
        matchedBy.push(`${field}:${value}`)
      }
    }

    if (tokenMatches.size !== queryTokens.length) continue
    if (icon.deprecated) score -= 25

    results.push({
      name: icon.name,
      componentName: icon.componentName,
      title: icon.title,
      titleZh: icon.titleZh,
      categories: icon.categories,
      subgroup: icon.subgroup,
      aliases: icon.aliases,
      deprecated: Boolean(icon.deprecated),
      score,
      matchedBy: [...new Set(matchedBy)],
      imports: {
        named: `import { ${icon.componentName} } from '@uplus-icon/react'`,
        direct: `import ${icon.componentName} from '@uplus-icon/react/icons/${icon.name}'`,
      },
      catalogOrder: icon.catalogOrder,
    })
  }

  return results
    .sort((a, b) => b.score - a.score || a.catalogOrder - b.catalogOrder || a.name.localeCompare(b.name))
    .slice(0, limit)
    .map(({ catalogOrder: _catalogOrder, ...result }) => result)
}

export async function loadIconMeta(cwd = process.cwd()) {
  const projectDir = resolve(cwd)
  const loader = [
    "import('@uplus-icon/core/metadata')",
    ".then(({ iconMeta }) => process.stdout.write(JSON.stringify(iconMeta)))",
    ".catch((error) => { process.stderr.write(error.message); process.exit(1) })",
  ].join('')
  const result = spawnSync(process.execPath, ['--input-type=module', '--eval', loader], {
    cwd: projectDir,
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
  })

  if (result.error || result.status !== 0) {
    const detail = result.error?.message ?? result.stderr.trim()
    throw new Error(`Could not load @uplus-icon/core/metadata from ${projectDir}. Install @uplus-icon/react in the consumer project first.${detail ? ` ${detail}` : ''}`)
  }

  let iconMeta
  try {
    iconMeta = JSON.parse(result.stdout)
  } catch {
    throw new Error('@uplus-icon/core/metadata returned invalid JSON.')
  }
  if (!Array.isArray(iconMeta)) {
    throw new Error('@uplus-icon/core/metadata did not export an iconMeta array.')
  }
  return iconMeta
}

function parseArguments(argv) {
  const options = { cwd: process.cwd(), limit: 8, includeDeprecated: false }
  const query = []

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]
    if (argument === '--cwd') {
      const value = argv[index + 1]
      if (!value) throw new Error('--cwd requires a path.')
      options.cwd = isAbsolute(value) ? value : resolve(process.cwd(), value)
      index += 1
    } else if (argument === '--limit') {
      const value = Number(argv[index + 1])
      if (!Number.isInteger(value) || value < 1 || value > 50) {
        throw new Error('--limit must be an integer from 1 to 50.')
      }
      options.limit = value
      index += 1
    } else if (argument === '--include-deprecated') {
      options.includeDeprecated = true
    } else if (argument.startsWith('--')) {
      throw new Error(`Unknown option: ${argument}`)
    } else {
      query.push(argument)
    }
  }

  return { options, query: query.join(' ') }
}

async function main() {
  try {
    const { options, query } = parseArguments(process.argv.slice(2))
    const iconMeta = await loadIconMeta(options.cwd)
    const results = rankIcons(iconMeta, query, options)
    process.stdout.write(`${JSON.stringify(results, null, 2)}\n`)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    process.stderr.write(`Uplus Icon search failed: ${message}\n`)
    process.exitCode = 1
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  await main()
}
