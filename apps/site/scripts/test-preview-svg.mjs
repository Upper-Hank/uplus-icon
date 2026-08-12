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
const coreUrl = new URL('../../../packages/core/dist/weight.js', import.meta.url).href
const runnableCode = code.replace("from \"@uplus-icon/core/internal/weight\"", `from ${JSON.stringify(coreUrl)}`)
const moduleUrl = `data:text/javascript;base64,${Buffer.from(runnableCode).toString('base64')}`
const { createPreviewSvg, resolveStaticPreviewSettings } = await import(moduleUrl)

const definition = {
  name: 'sample',
  viewBox: '0 0 24 24',
  body: `
<path d="M1 1H23" stroke="currentColor" stroke-width="1.5"/>
<circle cx="12" cy="12" r="3" fill="currentColor"/>
`,
}

test('copied SVG resolves size and applies proportional weight', () => {
  const svg = createPreviewSvg({
    definition,
    size: 32,
    weight: 1,
    absoluteWeight: false,
  })

  assert.match(svg, /width="32" height="32"/)
  assert.match(svg, /stroke-width="0.75"/)
  assert.match(svg, /r="2"/)
  assert.match(svg, /fill="currentColor"/)
})

test('copied SVG includes an explicitly selected preview color only when provided', () => {
  const inherited = createPreviewSvg({ definition, size: 24, weight: 2, absoluteWeight: false })
  const selected = createPreviewSvg({ definition, size: 24, weight: 2, absoluteWeight: false, color: '#2F6BFF' })

  assert.doesNotMatch(inherited, /<svg[^>]+\scolor=/)
  assert.match(selected, /<svg[^>]+ color="#2F6BFF">/)
})

test('only actual-size mode changes copied size while all modes retain weight', () => {
  assert.deepEqual(resolveStaticPreviewSettings('master', 80, 1.5, true), {
    absoluteWeight: false,
    size: 24,
    weight: 1.5,
  })
  assert.deepEqual(resolveStaticPreviewSettings('actual', 80, 1.5, true), {
    absoluteWeight: true,
    size: 80,
    weight: 1.5,
  })
})

test('copied SVG applies absolute weight to strokes and solid primitives', () => {
  const svg = createPreviewSvg({ definition, size: 48, weight: 2, absoluteWeight: true })
  assert.match(svg, /stroke-width="0.75"/)
  assert.match(svg, /r="1.5"/)
})

test('copied SVG supports absolute weights above the relative master range', () => {
  const svg = createPreviewSvg({ definition, size: 48, weight: 8, absoluteWeight: true })
  assert.match(svg, /stroke-width="3"/)
  assert.match(svg, /r="4\.5"/)
})

test('copied textarea SVG applies the anchored handle rule', () => {
  const textarea = {
    name: 'textarea',
    viewBox: '0 0 24 24',
    body: '<path d="M15 14L19 14V17H15Z" fill="currentColor"/>',
  }
  const relative = createPreviewSvg({ definition: textarea, size: 24, weight: 1.5, absoluteWeight: false })
  const absolute = createPreviewSvg({ definition: textarea, size: 48, weight: 1.5, absoluteWeight: true })

  assert.match(relative, /translate\(19 17\) scale\(0.8333\) translate\(-19 -17\)/)
  assert.match(absolute, /translate\(19 17\) scale\(0.4167\) translate\(-19 -17\)/)
})

test('copied headset SVG preserves path geometry and scales its solid dot', () => {
  const headset = {
    name: 'headset',
    viewBox: '0 0 24 24',
    body: '<path d="M15.5 19.5C15.5 20.3284 14.8284 21 14 21Z" fill="currentColor"/><path d="M3 12C3 10.8954 3.89543 10 5 10Z" stroke="currentColor" stroke-width="2"/>',
  }
  const svg = createPreviewSvg({ definition: headset, size: 48, weight: 1.5, absoluteWeight: true })

  assert.match(svg, /d="M3 12C3 10.8954 3.89543 10 5 10Z"/)
  assert.match(svg, /translate\(14 19.5\) scale\(0.4167\) translate\(-14 -19.5\)/)
})

test('copied qr-code SVG scales each solid finder square around its own center', () => {
  const qrCode = {
    name: 'qr-code',
    viewBox: '0 0 24 24',
    body: '<path d="square-a" fill="currentColor"/><path d="square-b" fill="currentColor"/><path d="square-c" fill="currentColor"/>',
  }
  const relative = createPreviewSvg({ definition: qrCode, size: 24, weight: 0.5, absoluteWeight: false })
  const absolute = createPreviewSvg({ definition: qrCode, size: 48, weight: 1.5, absoluteWeight: true })

  for (const transform of [
    'translate\\(7 7\\) scale\\(0.5\\) translate\\(-7 -7\\)',
    'translate\\(17 7\\) scale\\(0.5\\) translate\\(-17 -7\\)',
    'translate\\(7 17\\) scale\\(0.5\\) translate\\(-7 -17\\)',
  ]) assert.match(relative, new RegExp(transform))
  assert.match(absolute, /translate\(7 7\) scale\(0.4167\) translate\(-7 -7\)/)
})
