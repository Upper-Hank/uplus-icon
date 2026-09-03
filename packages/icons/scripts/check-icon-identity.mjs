import { readFile, readdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  collectLegacyNames,
  compareSemver,
  isValidIconId,
  isValidSemver,
  manifestVersionFromFilename,
  resolvePublicName,
  selectPreviousManifestVersion,
  validateIconIdentityMetadata,
} from './icon-identity.mjs'

const sourceRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const workspaceRoot = dirname(dirname(sourceRoot))
const metadataFile = join(sourceRoot, 'metadata', 'icons.json')
const releasesDir = join(sourceRoot, 'metadata', 'releases')
const corePackageFile = join(workspaceRoot, 'packages', 'core', 'package.json')

function parseArgs(argv) {
  const args = { previous: null }
  for (let index = 2; index < argv.length; index += 1) {
    if (argv[index] === '--previous') {
      args.previous = argv[index + 1]
      index += 1
    }
  }
  return args
}

async function resolvePreviousManifest(previousArg, currentVersion) {
  if (previousArg) return JSON.parse(await readFile(previousArg, 'utf8'))

  const manifestVersions = (await readdir(releasesDir))
    .map((filename) => manifestVersionFromFilename(filename))
    .filter(Boolean)
  const previousVersion = selectPreviousManifestVersion(manifestVersions, currentVersion)
  if (!previousVersion) return null
  return JSON.parse(await readFile(join(releasesDir, `${previousVersion}.json`), 'utf8'))
}

function reportSection(title, lines) {
  if (lines.length === 0) return
  console.log(`\n${title}:`)
  for (const line of lines) console.log(`  ${line}`)
}

const args = parseArgs(process.argv)
const metadata = JSON.parse(await readFile(metadataFile, 'utf8'))
const corePackage = JSON.parse(await readFile(corePackageFile, 'utf8'))
const previousManifest = await resolvePreviousManifest(args.previous, corePackage.version)

validateIconIdentityMetadata(metadata)

const errors = []
const renamed = []
const added = []
const informational = []

const currentById = new Map()
for (const [sourceKey, details] of Object.entries(metadata)) {
  currentById.set(details.id, {
    sourceKey,
    publicName: resolvePublicName(sourceKey, details),
    legacyNames: collectLegacyNames(details),
    deprecated: details.deprecated ?? false,
  })
}

if (previousManifest) {
  if (args.previous && compareSemver(previousManifest.packageVersion, corePackage.version) > 0) {
    errors.push(`Previous manifest ${previousManifest.packageVersion} must not be newer than ${corePackage.version}`)
  }

  const previousById = new Map(previousManifest.icons.map((icon) => [icon.id, icon]))
  const previousByName = new Map(previousManifest.icons.map((icon) => [icon.name, icon]))

  for (const [id, current] of currentById.entries()) {
    const previous = previousById.get(id)
    if (!previous) {
      added.push(`${current.publicName}\n  ID: ${id}`)
      continue
    }

    if (previous.sourceKey !== current.sourceKey) {
      errors.push(`ID ${id} previously belonged to source key "${previous.sourceKey}" but now belongs to "${current.sourceKey}"`)
    }

    if (previous.name !== current.publicName) {
      const legacy = current.legacyNames.find((entry) => entry.name === previous.name)
      if (!legacy) {
        errors.push(`"${previous.name}" was renamed to "${current.publicName}" without recording legacyNames`)
      } else if (!isValidSemver(legacy.renamedIn)) {
        errors.push(`"${previous.name}" rename to "${current.publicName}" has an invalid renamedIn version`)
      } else {
        renamed.push(`${previous.name} -> ${current.publicName}\n  ID: ${id}\n  Renamed in: ${legacy.renamedIn}`)
      }
    }
  }

  for (const previous of previousManifest.icons) {
    if (!currentById.has(previous.id)) {
      const replacement = [...currentById.values()].find((icon) => icon.publicName === previous.name)
      if (replacement?.deprecated) {
        informational.push(`Deprecated icon retained with new metadata: ${previous.name} (${previous.id})`)
      } else {
        errors.push(`"${previous.name}" (${previous.id}) was removed without a deprecation record`)
      }
    }
  }

  for (const [name, previous] of previousByName.entries()) {
    const currentOwner = [...currentById.entries()].find(([, icon]) => icon.publicName === name)
    if (currentOwner && currentOwner[0] !== previous.id) {
      errors.push(`"${name}" previously belonged to ${previous.id} but now belongs to ${currentOwner[0]}`)
    }
  }
}

for (const [sourceKey, details] of Object.entries(metadata)) {
  if (!isValidIconId(details.id)) {
    errors.push(`Metadata for ${sourceKey} has an invalid id: ${details.id}`)
  }
}

console.log('Icon identity check')
if (previousManifest) {
  console.log(`Compared against release manifest ${previousManifest.packageVersion}`)
} else {
  console.log('No earlier release manifest found; skipped cross-version checks')
}
reportSection('Renamed', renamed)
reportSection('Added', added)
reportSection('Notes', informational)
reportSection('Errors', errors)

if (errors.length > 0) {
  process.exitCode = 1
} else {
  console.log('\nNo blocking identity issues found.')
}
