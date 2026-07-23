import assert from 'node:assert/strict'
import test from 'node:test'
import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { transformWithEsbuild } from 'vite'

const siteRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const sourcePath = join(siteRoot, 'src', 'app', 'previewSvg.ts')
const source = await readFile(sourcePath, 'utf8')
const { code } = await transformWithEsbuild(source, sourcePath, {
  format: 'esm',
  loader: 'ts',
  target: 'es2020',
})
const moduleUrl = `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`
const { createPreviewSvg, resolveStaticPreviewSettings } = await import(moduleUrl)

const definition = {
  name: 'sample',
  viewBox: '0 0 24 24',
  body: `
<path vector-effect="var(--uplus-icon-vector-effect, none)" d="M1 1H23" stroke="currentColor" stroke-width="var(--uplus-icon-stroke-width, 1.5)"/>
<circle vector-effect="var(--uplus-icon-vector-effect, none)" cx="12" cy="12" r="3" fill="currentColor"/>
`,
}

test('copied SVG resolves the current size and source-independent stroke width', () => {
  const svg = createPreviewSvg({
    definition,
    size: 32,
    strokeWidth: 0.75,
    absoluteStrokeWidth: false,
  })

  assert.match(svg, /width="32" height="32"/)
  assert.match(svg, /stroke-width="0.75"/)
  assert.doesNotMatch(svg, /--uplus-icon-/)
  assert.doesNotMatch(svg, /vector-effect=/)
  assert.match(svg, /fill="currentColor"/)
})

test('copied SVG preserves the actual-size absolute stroke rendering', () => {
  const svg = createPreviewSvg({
    definition,
    size: 96,
    strokeWidth: 1.25,
    absoluteStrokeWidth: true,
  })

  assert.match(svg, /width="96" height="96"/)
  assert.equal((svg.match(/vector-effect="non-scaling-stroke"/g) ?? []).length, 2)
  assert.doesNotMatch(svg, /vector-effect="none"/)
})

test('only actual-size mode carries size and absolute stroke into copied usage', () => {
  assert.deepEqual(resolveStaticPreviewSettings('master', 80, 1.5, true), {
    size: 24,
    strokeWidth: 1.5,
    absoluteStrokeWidth: false,
  })
  assert.deepEqual(resolveStaticPreviewSettings('actual', 80, 1.5, true), {
    size: 80,
    strokeWidth: 1.5,
    absoluteStrokeWidth: true,
  })
  assert.deepEqual(resolveStaticPreviewSettings('motion', 80, 1.5, true), {
    size: 24,
    strokeWidth: 1.5,
    absoluteStrokeWidth: false,
  })
})
