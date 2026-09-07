import { deflateRawSync, inflateRawSync } from 'node:zlib'

const CRC_TABLE = new Uint32Array(256)
for (let index = 0; index < 256; index += 1) {
  let crc = index
  for (let bit = 0; bit < 8; bit += 1) crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1
  CRC_TABLE[index] = crc >>> 0
}

const LOCAL_SIGNATURE = 0x04034b50
const CENTRAL_SIGNATURE = 0x02014b50
const EOCD_SIGNATURE = 0x06054b50
const UTF8_FLAG = 0x0800
const DEFLATE = 8
const DOS_TIME = 0
const DOS_DATE = 0x21

function crc32(data) {
  let crc = 0xffffffff
  for (const byte of data) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function u16(value) {
  const buffer = Buffer.allocUnsafe(2)
  buffer.writeUInt16LE(value)
  return buffer
}

function u32(value) {
  const buffer = Buffer.allocUnsafe(4)
  buffer.writeUInt32LE(value)
  return buffer
}

export function createZip(entries) {
  const locals = []
  const centrals = []
  let offset = 0

  for (const { name, data } of entries) {
    const nameBuffer = Buffer.from(name, 'utf8')
    const uncompressed = Buffer.isBuffer(data) ? data : Buffer.from(data)
    const compressed = deflateRawSync(uncompressed, { level: 9 })
    const checksum = crc32(uncompressed)
    const local = Buffer.concat([
      u32(LOCAL_SIGNATURE),
      u16(20),
      u16(UTF8_FLAG),
      u16(DEFLATE),
      u16(DOS_TIME),
      u16(DOS_DATE),
      u32(checksum),
      u32(compressed.length),
      u32(uncompressed.length),
      u16(nameBuffer.length),
      u16(0),
      nameBuffer,
      compressed,
    ])
    const central = Buffer.concat([
      u32(CENTRAL_SIGNATURE),
      u16(20),
      u16(20),
      u16(UTF8_FLAG),
      u16(DEFLATE),
      u16(DOS_TIME),
      u16(DOS_DATE),
      u32(checksum),
      u32(compressed.length),
      u32(uncompressed.length),
      u16(nameBuffer.length),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(0),
      u32(offset),
      nameBuffer,
    ])
    locals.push(local)
    centrals.push(central)
    offset += local.length
  }

  const centralDirectory = Buffer.concat(centrals)
  return Buffer.concat([
    ...locals,
    centralDirectory,
    u32(EOCD_SIGNATURE),
    u16(0),
    u16(0),
    u16(entries.length),
    u16(entries.length),
    u32(centralDirectory.length),
    u32(offset),
    u16(0),
  ])
}

export function unzip(archive) {
  const files = new Map()
  let offset = 0

  while (offset + 4 <= archive.length) {
    const signature = archive.readUInt32LE(offset)
    if (signature === CENTRAL_SIGNATURE || signature === EOCD_SIGNATURE) break
    if (signature !== LOCAL_SIGNATURE) throw new Error('Invalid zip local file header')

    const method = archive.readUInt16LE(offset + 8)
    const compressedSize = archive.readUInt32LE(offset + 18)
    const uncompressedSize = archive.readUInt32LE(offset + 22)
    const nameLength = archive.readUInt16LE(offset + 26)
    const extraLength = archive.readUInt16LE(offset + 28)
    const nameStart = offset + 30
    const dataStart = nameStart + nameLength + extraLength
    const name = archive.subarray(nameStart, nameStart + nameLength).toString('utf8')
    const compressed = archive.subarray(dataStart, dataStart + compressedSize)
    const data = method === 0 ? compressed : inflateRawSync(compressed)
    if (data.length !== uncompressedSize) throw new Error(`Zip entry ${name} has an unexpected size`)
    files.set(name, data)
    offset = dataStart + compressedSize
  }

  return files
}
