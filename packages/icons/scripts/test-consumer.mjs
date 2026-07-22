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
  execFileSync('npm', ['install', '--ignore-scripts', ...tarballs, 'react@19', 'react-dom@19', '@types/react@19', '@types/react-dom@19', 'typescript@5'], { cwd: temp, env: npmEnv, stdio: 'pipe' })
  await writeFile(join(temp, 'tsconfig.json'), JSON.stringify({
    compilerOptions: { module: 'NodeNext', moduleResolution: 'NodeNext', target: 'ES2020', lib: ['ES2020', 'DOM'], jsx: 'react-jsx', strict: true, outDir: 'build' },
    include: ['consumer.tsx'],
  }))
  await writeFile(join(temp, 'consumer.tsx'), `
import type { IconName } from '@uplus-icon/core'
import { iconMeta } from '@uplus-icon/core/metadata'
import { CheckIcon } from '@uplus-icon/react'
import CheckIconDirect from '@uplus-icon/react/icons/check'
import { Icon } from '@uplus-icon/react/dynamic'
import { CheckIcon as createCheckIcon } from '@uplus-icon/web'
import { renderToStaticMarkup } from 'react-dom/server'

const name: IconName = 'check'
const markup = renderToStaticMarkup(<><CheckIcon strokeWidth={1.5} absoluteStrokeWidth /><CheckIconDirect strokeWidth={0.5} /><Icon name={name} strokeWidth={3} /></>)
if (!markup.includes('<svg') || !markup.includes('--uplus-icon-stroke-width:1.5') || !markup.includes('--uplus-icon-stroke-width:2') || !markup.includes('--uplus-icon-vector-effect:non-scaling-stroke') || !markup.includes('vector-effect="var(--uplus-icon-vector-effect, none)"') || iconMeta.length === 0 || typeof createCheckIcon !== 'function') {
  throw new Error('Installed packages did not expose the expected APIs')
}
console.log('Rendered installed packages with', iconMeta.length, 'metadata entries')
`)
  execFileSync(join(temp, 'node_modules', '.bin', 'tsc'), [], { cwd: temp, stdio: 'pipe' })
  const output = execFileSync('node', ['build/consumer.js'], { cwd: temp, encoding: 'utf8' }).trim()
  console.log(output)
} finally {
  await rm(temp, { recursive: true, force: true })
}
