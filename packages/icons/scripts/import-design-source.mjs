/**
 * Stages approved design-source SVGs into packages/icons/raw.
 *
 * The raw directory holds protected, owner-approved assets, so this tool is
 * strictly additive: it never deletes, never overwrites, and never rewrites
 * metadata/icons.json. Files that already exist with different bytes are
 * reported as conflicts and skipped — replacing an approved icon requires an
 * explicit decision by the project owner, not a batch script.
 */
import { copyFile, readFile, readdir, stat } from 'node:fs/promises'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseDesignSource, sourceKeyPattern } from './svg-source.mjs'

const sourceRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const rawDir = join(sourceRoot, 'raw')

function parseArgs(argv) {
  const args = { apply: false, source: null }
  for (let index = 2; index < argv.length; index += 1) {
    const argument = argv[index]
    if (argument === '--apply') args.apply = true
    else if (argument === '--source') {
      args.source = argv[index + 1] ?? null
      index += 1
    } else throw new Error(`Unknown argument: ${argument}`)
  }
  return args
}

const usage = [
  'Usage: node scripts/import-design-source.mjs --source <dir> [--apply]',
  '',
  '  --source <dir>  Directory containing owner-approved design-source SVGs.',
  '  --apply         Copy new icons into raw/. Without it the run is a preview.',
].join('\n')

const args = parseArgs(process.argv)
if (!args.source) {
  console.error(`A --source directory is required.\n\n${usage}`)
  process.exit(1)
}

const sourceDir = resolve(args.source)
if (!(await stat(sourceDir).catch(() => null))?.isDirectory()) {
  console.error(`Source directory does not exist: ${sourceDir}`)
  process.exit(1)
}

const existing = new Set((await readdir(rawDir)).filter((file) => file.endsWith('.svg')))
const candidates = (await readdir(sourceDir)).filter((file) => file.endsWith('.svg')).sort()

const invalid = []
const conflicting = []
const unchanged = []
const additions = []

for (const file of candidates) {
  const sourceKey = basename(file, '.svg')
  const svg = await readFile(join(sourceDir, file), 'utf8')

  if (!sourceKeyPattern.test(sourceKey)) {
    invalid.push({ file, reason: 'filename must use kebab-case, for example arrow-down.svg' })
    continue
  }
  try {
    parseDesignSource(file, svg)
  } catch (error) {
    invalid.push({ file, reason: error.message })
    continue
  }

  if (!existing.has(file)) {
    additions.push({ file, svg })
    continue
  }
  const approved = await readFile(join(rawDir, file), 'utf8')
  if (approved === svg) unchanged.push(file)
  else conflicting.push(file)
}

function report(title, entries, format = (entry) => entry) {
  if (entries.length === 0) return
  console.log(`\n${title} (${entries.length}):`)
  for (const entry of entries) console.log(`  ${format(entry)}`)
}

report('Rejected by design-source rules', invalid, ({ file, reason }) => `${file}: ${reason}`)
report('Already approved and identical', unchanged)
report('Conflicts with an approved icon, skipped', conflicting, (file) =>
  `${file}: differs from raw/${file}; ask the project owner before replacing it`)
report('New icons', additions, ({ file }) => file)

if (args.apply) {
  for (const { file } of additions) await copyFile(join(sourceDir, file), join(rawDir, file))
  console.log(`\nCopied ${additions.length} new icons into ${rawDir} without altering existing assets.`)
} else if (additions.length > 0) {
  console.log('\nPreview only. Re-run with --apply to copy the new icons.')
}

if (additions.length > 0) {
  console.log('\nEach new icon still needs a metadata entry in metadata/icons.json before it can be generated.')
  console.log('Add the entry, run `npm run assign-ids`, then run `npm run generate`. Stub for reference:')
  const stub = Object.fromEntries(additions.map(({ file }) => [basename(file, '.svg'), {
    title: 'TODO English title',
    titleZh: 'TODO 中文名称',
    categories: ['TODO category id from metadata/categories.json'],
    subgroup: 'TODO subgroup id from metadata/subgroups.json',
    tags: ['TODO must include the primary category and subgroup'],
    aliases: [],
  }]))
  console.log(JSON.stringify(stub, null, 2))
}

if (invalid.length > 0) process.exit(1)
