import assert from 'node:assert/strict'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import test from 'node:test'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import {
  loadIconMeta,
  normalizeText,
  rankIcons,
} from '../../plugins/uplus-icon/skills/use-uplus-icon/scripts/search-icons.mjs'

const icons = [
  {
    name: 'arrow-left', componentName: 'ArrowLeftIcon', title: 'Arrow Left', titleZh: '向左箭头',
    categories: ['navigation'], subgroup: 'arrow', tags: ['navigation', '导航', 'arrow', '箭头'],
    aliases: ['back', 'previous'], deprecated: false, catalogOrder: 2,
  },
  {
    name: 'medal', componentName: 'MedalIcon', title: 'Medal', titleZh: '奖牌',
    categories: ['status'], subgroup: 'achievement', tags: ['status', '状态', 'achievement', '成就'],
    aliases: [], legacyNames: [{ name: 'badge', renamedIn: '0.1.0-beta.2' }], deprecated: false, catalogOrder: 4,
  },
  {
    name: 'trash', componentName: 'TrashIcon', title: 'Trash', titleZh: '删除',
    categories: ['actions'], subgroup: 'management', tags: ['actions', '操作', 'management', '管理'],
    aliases: ['delete'], deprecated: false, catalogOrder: 1,
  },
  {
    name: 'old-trash', componentName: 'OldTrashIcon', title: 'Old Trash', titleZh: '旧删除',
    categories: ['actions'], subgroup: 'management', tags: ['delete'], aliases: [], deprecated: true,
    catalogOrder: 3,
  },
]

test('normalizes kebab-case, component names, and Unicode text', () => {
  assert.equal(normalizeText('ArrowLeftIcon'), 'arrow left icon')
  assert.equal(normalizeText('arrow-left'), 'arrow left')
  assert.equal(normalizeText('  删除  '), '删除')
})

test('ranks exact names, Chinese titles, and aliases without inventing results', () => {
  assert.equal(rankIcons(icons, 'arrow-left')[0].name, 'arrow-left')
  assert.equal(rankIcons(icons, '删除')[0].name, 'trash')
  assert.equal(rankIcons(icons, 'previous')[0].name, 'arrow-left')
  assert.equal(rankIcons(icons, 'badge')[0].name, 'medal')
  assert.deepEqual(rankIcons(icons, 'cloud sync'), [])
})

test('requires every query token and emits stable import guidance', () => {
  const [result] = rankIcons(icons, 'navigation arrow')
  assert.equal(result.name, 'arrow-left')
  assert.equal(result.imports.named, "import { ArrowLeftIcon } from '@uplus-icon/react'")
  assert.equal(result.imports.direct, "import ArrowLeftIcon from '@uplus-icon/react/icons/arrow-left'")
})

test('filters deprecated icons unless explicitly included', () => {
  assert.deepEqual(rankIcons(icons, 'old trash'), [])
  assert.equal(rankIcons(icons, 'old trash', { includeDeprecated: true })[0].name, 'old-trash')
})

test('loads public metadata from the consumer cwd', async (context) => {
  const consumer = await mkdtemp(join(tmpdir(), 'uplus-icon-plugin-test-'))
  context.after(() => rm(consumer, { recursive: true, force: true }))

  const core = join(consumer, 'node_modules', '@uplus-icon', 'core')
  await mkdir(core, { recursive: true })
  await writeFile(join(consumer, 'package.json'), JSON.stringify({ private: true, type: 'module' }))
  await writeFile(join(core, 'package.json'), JSON.stringify({
    name: '@uplus-icon/core',
    type: 'module',
    exports: { './metadata': './metadata.js' },
  }))
  await writeFile(join(core, 'metadata.js'), `export const iconMeta = ${JSON.stringify(icons)}\n`)

  const iconMeta = await loadIconMeta(consumer)
  assert.deepEqual(iconMeta.map((icon) => icon.name), ['arrow-left', 'medal', 'trash', 'old-trash'])
})

test('does not fall back to dependencies installed beside the plugin', async () => {
  await assert.rejects(
    loadIconMeta('/private/tmp'),
    /Install @uplus-icon\/react in the consumer project first/,
  )
})
