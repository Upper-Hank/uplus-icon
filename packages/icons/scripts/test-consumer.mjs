import { execFileSync } from 'node:child_process'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const workspace = join(root, '..', '..')
const temp = await mkdtemp(join(tmpdir(), 'uplus-icon-consumer-'))

try {
  execFileSync('npm', ['pack', '--pack-destination', temp, '-w', 'uplus-icon'], { cwd: workspace, stdio: 'pipe' })
  const tarball = join(temp, 'uplus-icon-0.1.0.tgz')
  await writeFile(join(temp, 'package.json'), JSON.stringify({ name: 'uplus-icon-consumer', private: true, type: 'module' }))
  execFileSync('npm', ['install', '--ignore-scripts', tarball, 'react@19', 'react-dom@19', '@types/react@19', '@types/react-dom@19', 'typescript@5'], { cwd: temp, stdio: 'pipe' })
  await writeFile(join(temp, 'tsconfig.json'), JSON.stringify({
    compilerOptions: { module: 'NodeNext', moduleResolution: 'NodeNext', target: 'ES2020', jsx: 'react-jsx', strict: true, outDir: 'build' },
    include: ['consumer.tsx'],
  }))
  await writeFile(join(temp, 'consumer.tsx'), `
import { SearchIcon } from 'uplus-icon'
import SearchIconDirect from 'uplus-icon/icons/search'
import { Icon } from 'uplus-icon/dynamic'
import { iconMeta } from 'uplus-icon/metadata'
import { renderToStaticMarkup } from 'react-dom/server'

const markup = renderToStaticMarkup(<><SearchIcon /><SearchIconDirect /><Icon name="search" /></>)
if (!markup.includes('<svg') || iconMeta.length === 0) throw new Error('Installed package did not render')
console.log('Rendered installed tarball with', iconMeta.length, 'metadata entries')
`)
  execFileSync(join(temp, 'node_modules', '.bin', 'tsc'), [], { cwd: temp, stdio: 'pipe' })
  const output = execFileSync('node', ['build/consumer.js'], { cwd: temp, encoding: 'utf8' }).trim()
  console.log(output)

  const installed = JSON.parse(await readFile(join(temp, 'node_modules', 'uplus-icon', 'package.json'), 'utf8'))
  if (installed.name !== 'uplus-icon') throw new Error('Tarball installed with an unexpected package name')
} finally {
  await rm(temp, { recursive: true, force: true })
}
