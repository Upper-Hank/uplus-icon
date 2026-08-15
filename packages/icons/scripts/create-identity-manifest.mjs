import { execFileSync } from 'node:child_process'
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
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
const reactPackageFile = join(workspaceRoot, 'packages', 'react', 'package.json')

const toPascal = (name) => name.split('-').map((part) => part[0].toUpperCase() + part.slice(1)).join('')

const metadata = JSON.parse(await readFile(metadataFile, 'utf8'))
const corePackage = JSON.parse(await readFile(corePackageFile, 'utf8'))
const reactPackage = JSON.parse(await readFile(reactPackageFile, 'utf8'))

if (corePackage.version !== reactPackage.version) {
  throw new Error(`Core (${corePackage.version}) and React (${reactPackage.version}) package versions must match`)
}

validateIconIdentityMetadata(metadata)

await mkdir(releasesDir, { recursive: true })
const manifestVersions = (await readdir(releasesDir))
  .map((filename) => manifestVersionFromFilename(filename))
  .filter(Boolean)
const previousVersion = selectPreviousManifestVersion(manifestVersions, corePackage.version)
if (previousVersion) {
  execFileSync(
    process.execPath,
    [join(sourceRoot, 'scripts', 'check-icon-identity.mjs'), '--previous', join(releasesDir, `${previousVersion}.json`)],
    { cwd: sourceRoot, stdio: 'inherit' },
  )
}

const icons = Object.entries(metadata)
  .map(([sourceKey, details]) => ({
    id: details.id,
    sourceKey,
    name: resolvePublicName(sourceKey, details),
    componentName: `${toPascal(resolvePublicName(sourceKey, details))}Icon`,
  }))
  .sort((left, right) => left.sourceKey.localeCompare(right.sourceKey))

const manifest = {
  schemaVersion: 1,
  packageVersion: corePackage.version,
  icons,
}

const outputFile = join(releasesDir, `${corePackage.version}.json`)
try {
  await writeFile(outputFile, `${JSON.stringify(manifest, null, 2)}\n`, { flag: 'wx' })
} catch (error) {
  if (error && typeof error === 'object' && 'code' in error && error.code === 'EEXIST') {
    throw new Error(`Release manifest already exists for ${corePackage.version}; historical manifests must not be overwritten`)
  }
  throw error
}
console.log(`Created identity manifest for ${corePackage.version} with ${icons.length} icons`)
