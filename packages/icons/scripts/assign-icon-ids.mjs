import { readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  generateIconId,
  isValidIconId,
  isValidPublicName,
  resolvePublicName,
  validateIconIdentityMetadata,
} from './icon-identity.mjs'

const sourceRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const metadataFile = join(sourceRoot, 'metadata', 'icons.json')

const metadata = JSON.parse(await readFile(metadataFile, 'utf8'))
let assigned = 0

for (const [sourceKey, details] of Object.entries(metadata)) {
  if (!details.id) {
    details.id = generateIconId()
    assigned += 1
  } else if (!isValidIconId(details.id)) {
    throw new Error(`Metadata for ${sourceKey} has an invalid id: ${details.id}`)
  }

  if (!details.name) {
    details.name = sourceKey
  } else if (!isValidPublicName(details.name)) {
    throw new Error(`Metadata for ${sourceKey} has an invalid public name: ${details.name}`)
  }

  if (resolvePublicName(sourceKey, details) !== details.name) {
    throw new Error(`Metadata for ${sourceKey} has inconsistent name field: ${details.name}`)
  }
}

validateIconIdentityMetadata(metadata)

await writeFile(metadataFile, `${JSON.stringify(metadata, null, 2)}\n`)
console.log(`Assigned ${assigned} new icon ids`)
