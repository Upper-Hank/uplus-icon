import { execFileSync } from 'node:child_process'
import { mkdtemp, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const sourceRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const workspace = join(sourceRoot, '..', '..')
const pluginSearch = join(workspace, 'plugins', 'uplus-icon', 'skills', 'use-uplus-icon', 'scripts', 'search-icons.mjs')
const temp = await mkdtemp(join(tmpdir(), 'uplus-icon-consumer-'))
const npmEnv = { ...process.env, npm_config_cache: join(temp, '.npm-cache') }

try {
  for (const packageName of ['@uplus-icon/core', '@uplus-icon/react']) {
    execFileSync('npm', ['pack', '--pack-destination', temp, '-w', packageName], { cwd: workspace, env: npmEnv, stdio: 'pipe' })
  }
  const tarballs = (await readdir(temp)).filter((file) => file.endsWith('.tgz')).map((file) => join(temp, file))
  if (tarballs.length !== 2) throw new Error(`Expected two package tarballs, found ${tarballs.length}`)

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
import { Icon as DynamicIcon } from '@uplus-icon/react/dynamic'
import PlusIconDirect from '@uplus-icon/react/icons/plus'
import { renderToStaticMarkup } from 'react-dom/server'

const name: IconName = 'plus'
const markup = renderToStaticMarkup(<><PlusIcon weight={1.5} /><PlusIconDirect size={48} weight={2} absoluteWeight /><DynamicIcon name="bell" /></>)
if (name !== 'plus' || !markup.includes('<svg') || !markup.includes('stroke-width="1.5"') || !markup.includes('stroke-width="1"') || iconMeta.length === 0) {
  throw new Error('Installed packages did not expose the expected APIs')
}
console.log('Rendered installed packages with', iconMeta.length, 'metadata entries')
`)
  execFileSync(join(temp, 'node_modules', '.bin', 'tsc'), [], { cwd: temp, stdio: 'pipe' })
  const output = execFileSync('node', ['build/consumer.js'], { cwd: temp, encoding: 'utf8' }).trim()
  const checkResults = JSON.parse(execFileSync(process.execPath, [pluginSearch, '--cwd', temp, 'check'], { cwd: temp, encoding: 'utf8' }))
  const deleteResults = JSON.parse(execFileSync(process.execPath, [pluginSearch, '--cwd', temp, '删除'], { cwd: temp, encoding: 'utf8' }))
  if (checkResults[0]?.name !== 'check' || deleteResults[0]?.name !== 'trash') {
    throw new Error('Consumer-side plugin search did not use the installed package metadata')
  }
  console.log(output)
  console.log('Searched installed package metadata through the consumer-side plugin')
} finally {
  await rm(temp, { recursive: true, force: true })
}
