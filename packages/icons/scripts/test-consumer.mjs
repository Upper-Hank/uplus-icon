import { execFileSync } from 'node:child_process'
import { mkdtemp, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const sourceRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const workspace = join(sourceRoot, '..', '..')
const temp = await mkdtemp(join(tmpdir(), 'uplus-icon-consumer-'))
const npmEnv = { ...process.env, npm_config_cache: join(temp, '.npm-cache') }

try {
  for (const packageName of ['@uplus-icon/core', '@uplus-icon/react', '@uplus-icon/web']) {
    execFileSync('npm', ['pack', '--pack-destination', temp, '-w', packageName], { cwd: workspace, env: npmEnv, stdio: 'pipe' })
  }
  const tarballs = (await readdir(temp)).filter((file) => file.endsWith('.tgz')).map((file) => join(temp, file))
  if (tarballs.length !== 3) throw new Error(`Expected three package tarballs, found ${tarballs.length}`)

  await writeFile(join(temp, 'package.json'), JSON.stringify({ name: 'uplus-icon-consumer', private: true, type: 'module' }))
  execFileSync('npm', ['install', '--ignore-scripts', ...tarballs, 'react@18', 'react-dom@18', '@types/react@18', '@types/react-dom@18', 'typescript@5'], { cwd: temp, env: npmEnv, stdio: 'pipe' })
  await writeFile(join(temp, 'tsconfig.json'), JSON.stringify({
    compilerOptions: { module: 'NodeNext', moduleResolution: 'NodeNext', target: 'ES2020', lib: ['ES2020', 'DOM'], jsx: 'react-jsx', strict: true, outDir: 'build' },
    include: ['consumer.tsx'],
  }))
  await writeFile(join(temp, 'consumer.tsx'), `
import type { IconName } from '@uplus-icon/core'
import { iconMeta } from '@uplus-icon/core/metadata'
import { PlusIcon } from '@uplus-icon/react'
import PlusIconDirect from '@uplus-icon/react/icons/plus'
import { PlusIcon as createPlusIcon } from '@uplus-icon/web'
import { renderToStaticMarkup } from 'react-dom/server'

const name: IconName = 'plus'
const markup = renderToStaticMarkup(<><PlusIcon weight={1.5} /><PlusIconDirect size={48} weight={2} absoluteWeight /></>)
if (name !== 'plus' || !markup.includes('<svg') || !markup.includes('stroke-width="1.5"') || !markup.includes('stroke-width="1"') || iconMeta.length === 0 || typeof createPlusIcon !== 'function') {
  throw new Error('Installed packages did not expose the expected APIs')
}
console.log('Rendered installed packages with', iconMeta.length, 'metadata entries')
`)
  await writeFile(join(temp, 'static-boundary.mjs'), `
for (const specifier of [
  '@uplus-icon/core/dynamic',
  '@uplus-icon/react/dynamic',
  '@uplus-icon/web/dynamic',
  '@uplus-icon/web/element',
]) {
  try {
    await import(specifier)
  } catch (error) {
    if (error?.code === 'ERR_PACKAGE_PATH_NOT_EXPORTED') continue
    throw error
  }
  throw new Error('First-release package unexpectedly exposes ' + specifier)
}
`)
  execFileSync(join(temp, 'node_modules', '.bin', 'tsc'), [], { cwd: temp, stdio: 'pipe' })
  const output = execFileSync('node', ['build/consumer.js'], { cwd: temp, encoding: 'utf8' }).trim()
  execFileSync('node', ['static-boundary.mjs'], { cwd: temp, stdio: 'pipe' })
  console.log(output)
} finally {
  await rm(temp, { recursive: true, force: true })
}
