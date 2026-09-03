import { build } from 'esbuild'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const sourceRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const packagesRoot = dirname(sourceRoot)
const reactDist = join(packagesRoot, 'react', 'dist')
const budget = 5_000
// The dynamic entry resolves names at runtime, so it necessarily carries the
// whole registry. This budget exists to catch unexpected growth, not to shrink it.
const dynamicBudget = 220_000

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

const directBytes = await bundleSize({ entryPoints: [join(reactDist, 'generated', 'icons', 'plus.js')] })
const rootBytes = await bundleSize({
  stdin: { contents: "import { PlusIcon } from '@uplus-icon/react'; console.log(PlusIcon)", resolveDir: sourceRoot },
  alias: { '@uplus-icon/react': join(reactDist, 'index.js') },
})

const dynamicBytes = await bundleSize({
  stdin: { contents: "import { Icon } from '@uplus-icon/react/dynamic'; console.log(Icon)", resolveDir: sourceRoot },
  alias: { '@uplus-icon/react/dynamic': join(reactDist, 'dynamic.js') },
})

const measurements = [
  ['Per-icon React', directBytes, budget],
  ['React root named import', rootBytes, budget],
  ['React dynamic name registry', dynamicBytes, dynamicBudget],
]

for (const [label, bytes, limit] of measurements) {
  if (bytes > limit) throw new Error(`${label} bundle is ${bytes} bytes, exceeding the ${limit} byte budget`)
  console.log(`${label} bundle: ${bytes} bytes (budget: ${limit} bytes)`)
}
