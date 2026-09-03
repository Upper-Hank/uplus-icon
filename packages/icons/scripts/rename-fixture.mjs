import { cp, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { generateIconId } from './icon-identity.mjs'

const scriptsRoot = dirname(fileURLToPath(import.meta.url))
const sourceRoot = dirname(scriptsRoot)
const workspaceRoot = dirname(dirname(sourceRoot))

const SCRIPT_FILES = [
  'generate.mjs',
  'catalog-order.mjs',
  'icon-identity.mjs',
  'svg-adapter.mjs',
  'svg-source.mjs',
  'validate-metadata.mjs',
  'check-icon-identity.mjs',
  'create-identity-manifest.mjs',
]
const CORE_SOURCE_FILES = ['types.ts', 'dynamic.ts', 'index.ts', 'metadata.ts', 'weight.ts']
const REACT_SOURCE_FILES = ['createIcon.tsx', 'IconBase.tsx', 'Icon.tsx', 'resolve-icon.ts', 'types.ts', 'dynamic.ts', 'index.ts']

export const RENAME_FIXTURE = {
  sourceKey: 'user',
  legacyName: 'user',
  currentName: 'account',
  renamedIn: '0.2.0',
  iconId: 'uicon_6142ff3b-3da2-4fd1-8d0c-f3687c2bdf8e',
}

export async function setupRenameFixtureWorkspace(tempRoot = null) {
  const root = tempRoot ?? await mkdtemp(join(tmpdir(), 'uplus-icon-rename-fixture-'))
  const fixtureWorkspace = join(root, 'workspace')
  const iconsRoot = join(fixtureWorkspace, 'packages', 'icons')
  const coreRoot = join(fixtureWorkspace, 'packages', 'core')
  const reactRoot = join(fixtureWorkspace, 'packages', 'react')

  await mkdir(join(iconsRoot, 'scripts'), { recursive: true })
  await mkdir(join(iconsRoot, 'raw'), { recursive: true })
  await mkdir(join(iconsRoot, 'metadata', 'releases'), { recursive: true })
  await mkdir(join(coreRoot, 'src'), { recursive: true })
  await mkdir(join(reactRoot, 'src'), { recursive: true })

  for (const file of SCRIPT_FILES) {
    await cp(join(scriptsRoot, file), join(iconsRoot, 'scripts', file))
  }

  await cp(join(sourceRoot, 'raw', 'user.svg'), join(iconsRoot, 'raw', 'user.svg'))
  await cp(join(sourceRoot, 'metadata', 'categories.json'), join(iconsRoot, 'metadata', 'categories.json'))
  await cp(join(sourceRoot, 'metadata', 'subgroups.json'), join(iconsRoot, 'metadata', 'subgroups.json'))
  await writeFile(join(iconsRoot, 'metadata', 'taxonomy.mjs'), `export const figmaTaxonomy = {
  objects: {
    identity: ['user'],
  },
}

export const subgroupLabels = {
  identity: ['Identity', '身份'],
}

export const categoryRegistry = [
  { id: 'objects', title: 'Objects', titleZh: '对象', description: 'Fixture category' },
]
`)

  const icons = {
    user: {
      id: RENAME_FIXTURE.iconId,
      name: RENAME_FIXTURE.currentName,
      title: 'Account',
      titleZh: '账户',
      categories: ['objects'],
      subgroup: 'identity',
      tags: ['objects', '对象', 'identity', '身份'],
      aliases: [],
      legacyNames: [{ name: RENAME_FIXTURE.legacyName, renamedIn: RENAME_FIXTURE.renamedIn }],
    },
  }
  await writeFile(join(iconsRoot, 'metadata', 'icons.json'), `${JSON.stringify(icons, null, 2)}\n`)

  await writeFile(join(iconsRoot, 'metadata', 'releases', '0.1.0.json'), `${JSON.stringify({
    schemaVersion: 1,
    packageVersion: '0.1.0',
    icons: [{
      id: RENAME_FIXTURE.iconId,
      sourceKey: RENAME_FIXTURE.sourceKey,
      name: RENAME_FIXTURE.legacyName,
      componentName: 'UserIcon',
    }],
  }, null, 2)}\n`)

  for (const file of CORE_SOURCE_FILES) {
    await cp(join(workspaceRoot, 'packages/core/src', file), join(coreRoot, 'src', file))
  }
  for (const file of REACT_SOURCE_FILES) {
    await cp(join(workspaceRoot, 'packages/react/src', file), join(reactRoot, 'src', file))
  }

  await writeFile(join(coreRoot, 'package.json'), `${JSON.stringify({
    name: '@uplus-icon/core',
    version: '0.2.0',
    type: 'module',
    scripts: { build: 'rm -rf dist && tsc' },
    exports: {
      '.': { types: './dist/index.d.ts', import: './dist/index.js' },
      './dynamic': { types: './dist/dynamic.d.ts', import: './dist/dynamic.js' },
      './metadata': { types: './dist/metadata.d.ts', import: './dist/metadata.js' },
      './internal/weight': { types: './dist/weight.d.ts', import: './dist/weight.js' },
      './icons/*': { types: './dist/generated/icons/*.d.ts', import: './dist/generated/icons/*.js' },
    },
  }, null, 2)}\n`)

  await writeFile(join(reactRoot, 'package.json'), `${JSON.stringify({
    name: '@uplus-icon/react',
    version: '0.2.0',
    type: 'module',
    scripts: { build: 'rm -rf dist && tsc' },
    dependencies: { '@uplus-icon/core': 'file:../core' },
    peerDependencies: { react: '>=18' },
    exports: {
      '.': { types: './dist/index.d.ts', import: './dist/index.js' },
      './dynamic': { types: './dist/dynamic.d.ts', import: './dist/dynamic.js' },
      './icons/*': { types: './dist/generated/icons/*.d.ts', import: './dist/generated/icons/*.js' },
    },
  }, null, 2)}\n`)

  await cp(join(workspaceRoot, 'packages/core/tsconfig.json'), join(coreRoot, 'tsconfig.json'))
  await cp(join(workspaceRoot, 'packages/react/tsconfig.json'), join(reactRoot, 'tsconfig.json'))

  await writeFile(join(fixtureWorkspace, 'package.json'), `${JSON.stringify({
    name: 'uplus-icon-rename-fixture',
    private: true,
    workspaces: ['packages/*'],
  }, null, 2)}\n`)

  const fixtureNodeModules = join(fixtureWorkspace, 'node_modules')
  await mkdir(join(fixtureNodeModules, '@uplus-icon'), { recursive: true })
  for (const dependency of ['react', 'react-dom', '@types']) {
    await symlink(join(workspaceRoot, 'node_modules', dependency), join(fixtureNodeModules, dependency), 'junction')
  }
  await symlink(coreRoot, join(fixtureNodeModules, '@uplus-icon', 'core'), 'junction')

  const tsc = join(workspaceRoot, 'node_modules', '.bin', 'tsc')

  execFileSync('node', ['scripts/generate.mjs'], { cwd: iconsRoot, stdio: 'pipe' })
  execFileSync(tsc, [], { cwd: coreRoot, stdio: 'pipe' })
  execFileSync(tsc, [], { cwd: reactRoot, stdio: 'pipe' })

  return {
    root,
    fixtureWorkspace,
    iconsRoot,
    coreRoot,
    reactRoot,
    cleanup: async () => rm(root, { recursive: true, force: true }),
  }
}

export async function readFixtureComponentsBarrel(reactRoot) {
  return readFile(join(reactRoot, 'src', 'generated', 'components.ts'), 'utf8')
}

export function createFixtureMetadataEntry(overrides = {}) {
  return {
    id: generateIconId(),
    name: 'alpha',
    aliases: [],
    related: [],
    variants: [],
    publishedIn: null,
    updatedIn: null,
    ...overrides,
  }
}
