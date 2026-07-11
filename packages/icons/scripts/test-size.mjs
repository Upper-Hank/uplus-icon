import { build } from 'esbuild'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const dist = join(root, 'dist')
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

const directBytes = await bundleSize({ entryPoints: [join(dist, 'icons', 'search.js')] })
const rootBytes = await bundleSize({
  stdin: { contents: "import { SearchIcon } from 'uplus-icon'; console.log(SearchIcon)", resolveDir: root },
  alias: { 'uplus-icon': join(dist, 'index.js') },
})

for (const [label, bytes] of [['Per-icon', directBytes], ['Root named import', rootBytes]]) {
  if (bytes > budget) throw new Error(`${label} bundle is ${bytes} bytes, exceeding the ${budget} byte budget`)
  console.log(`${label} bundle: ${bytes} bytes (budget: ${budget} bytes)`)
}
