import { build } from 'esbuild'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const sourceRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const packagesRoot = dirname(sourceRoot)
const reactDist = join(packagesRoot, 'react', 'dist')
const budget = 5_000

async function bundleSize(options) {
  const result = await build({
    bundle: true,
    minify: true,
    format: 'esm',
    external: ['react', 'react/jsx-runtime'],
    write: false,
    ...options,
  })
  return result.outputFiles.reduce((total, file) => total + file.contents.byteLength, 0)
}

const directBytes = await bundleSize({ entryPoints: [join(reactDist, 'generated', 'icons', 'check.js')] })
const rootBytes = await bundleSize({
  stdin: { contents: "import { CheckIcon } from '@uplus-icon/react'; console.log(CheckIcon)", resolveDir: sourceRoot },
  alias: { '@uplus-icon/react': join(reactDist, 'index.js') },
})

for (const [label, bytes] of [['Per-icon React', directBytes], ['React root named import', rootBytes]]) {
  if (bytes > budget) throw new Error(`${label} bundle is ${bytes} bytes, exceeding the ${budget} byte budget`)
  console.log(`${label} bundle: ${bytes} bytes (budget: ${budget} bytes)`)
}
