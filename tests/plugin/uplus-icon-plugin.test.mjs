import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const repositoryRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const pluginRoot = join(repositoryRoot, 'plugins', 'uplus-icon')

const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'))

test('plugin manifest exposes one user-side skill without MCP or app dependencies', async () => {
  const manifest = await readJson(join(pluginRoot, '.codex-plugin', 'plugin.json'))
  assert.equal(manifest.name, 'uplus-icon')
  assert.equal(manifest.skills, './skills/')
  assert.equal(manifest.interface.category, 'Developer Tools')
  assert.ok(!('mcpServers' in manifest))
  assert.ok(!('apps' in manifest))
  assert.ok(!('hooks' in manifest))
})

test('repo marketplace points at the local plugin with explicit policy', async () => {
  const marketplace = await readJson(join(repositoryRoot, '.agents', 'plugins', 'marketplace.json'))
  const entry = marketplace.plugins.find((plugin) => plugin.name === 'uplus-icon')
  assert.ok(entry)
  assert.deepEqual(entry.source, { source: 'local', path: './plugins/uplus-icon' })
  assert.deepEqual(entry.policy, { installation: 'AVAILABLE', authentication: 'ON_INSTALL' })
  assert.equal(entry.category, 'Developer Tools')
})

test('skill is consumer-scoped and contains no scaffold placeholders', async () => {
  const skill = await readFile(join(pluginRoot, 'skills', 'use-uplus-icon', 'SKILL.md'), 'utf8')
  assert.match(skill, /^name: use-uplus-icon$/m)
  assert.match(skill, /public Uplus Icon packages/)
  assert.doesNotMatch(skill, /\[TODO:/)
})
