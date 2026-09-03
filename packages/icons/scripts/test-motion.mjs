import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { animateIcon, resolveMotionRule, semanticMotionRules } from '../../motion/dist/index.js'

const sourceRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const metadata = JSON.parse(await readFile(join(sourceRoot, 'metadata', 'icons.json'), 'utf8'))

class FakeAnimation {
  currentTime = 0
  playState = 'running'
  playbackRate = 1
  ready = Promise.resolve()

  constructor(keyframes, timing) {
    this.keyframes = keyframes
    this.timing = timing
  }

  cancel() { this.currentTime = null; this.playState = 'idle' }
  finish() { this.currentTime = Number(this.timing.duration); this.playState = 'finished' }
  pause() { this.playState = 'paused' }
  play() { if (this.currentTime === null) this.currentTime = 0; this.playState = 'running' }
  reverse() { this.playState = 'running'; this.playbackRate = -1 }
}

const createStyle = () => ({
  values: new Map(),
  set transformOrigin(value) { this.values.set('transform-origin', value) },
  set strokeDasharray(value) { this.values.set('stroke-dasharray', value) },
  set strokeDashoffset(value) { this.values.set('stroke-dashoffset', value) },
  removeProperty(name) { this.values.delete(name) },
})

const createSvg = (geometry = []) => {
  const animations = []
  return {
    animations,
    getBoundingClientRect: () => ({ width: 24, height: 24 }),
    getBBox: () => ({ x: 0, y: 0, width: 24, height: 24 }),
    style: createStyle(),
    animate(keyframes, timing) {
      const animation = new FakeAnimation(keyframes, timing)
      animations.push(animation)
      return animation
    },
    querySelectorAll() { return geometry },
  }
}

const settle = () => new Promise((resolve) => setTimeout(resolve, 0))

test('declared semantic capabilities exist in the rules package and vice versa', () => {
  const declared = new Map()
  for (const [sourceKey, details] of Object.entries(metadata)) {
    const semantic = details.motion?.semantic ?? []
    if (semantic.length > 0) declared.set(details.name ?? sourceKey, [...semantic].sort())
  }

  const implemented = new Map(
    Object.entries(semanticMotionRules).map(([name, rules]) => [name, Object.keys(rules).sort()]),
  )

  assert.deepEqual([...declared.keys()].sort(), [...implemented.keys()].sort(), 'metadata and rules must declare the same animated icons')
  for (const [name, capabilities] of declared) {
    assert.deepEqual(capabilities, implemented.get(name), `${name} capabilities must match the rules package`)
  }
})

test('generic rules are shared while semantic rules are selected by icon name', () => {
  assert.equal(resolveMotionRule('user', 'fade')?.duration, 1000)
  assert.equal(resolveMotionRule('bell', 'ring')?.duration, 1000)
  assert.equal(resolveMotionRule('heart', 'ring'), undefined)
})

test('an unplayed icon keeps its static appearance because the animation stays idle', () => {
  globalThis.matchMedia = () => ({ matches: false })
  const svg = createSvg()
  const controls = animateIcon(svg, 'bell', 'ring')

  assert.equal(svg.animations.length, 1)
  assert.equal(svg.animations[0].playState, 'idle', 'an idle animation applies no keyframes')
  assert.equal(svg.animations[0].currentTime, null)
  assert.equal(controls.progress(), 0)
})

test('autoplay starts immediately at the entry keyframe', () => {
  globalThis.matchMedia = () => ({ matches: false })
  const svg = createSvg()
  animateIcon(svg, 'bell', 'ring', { autoplay: true })

  assert.equal(svg.animations[0].playState, 'running')
  assert.equal(svg.animations[0].currentTime, 0)
  assert.equal(svg.animations[0].playbackRate, 1)
})

test('controls expose deterministic playback and return to the static state', async () => {
  globalThis.matchMedia = () => ({ matches: false })
  const svg = createSvg()
  const controls = animateIcon(svg, 'bell', 'ring')

  controls.play()
  await settle()
  assert.equal(svg.animations[0].playState, 'running')

  controls.pause()
  await settle()
  assert.equal(svg.animations[0].playState, 'paused')

  controls.reverse()
  await settle()
  assert.equal(svg.animations[0].playbackRate, -1)

  controls.seek(0.5)
  await settle()
  assert.equal(svg.animations[0].currentTime, 500)
  assert.equal(controls.progress(), 0.5)

  controls.reset()
  await settle()
  assert.equal(svg.animations[0].playState, 'idle', 'reset must restore the static icon, not the first keyframe')
  assert.equal(controls.progress(), 0)

  controls.dispose()
  assert.equal(svg.animations[0].playState, 'idle')
  assert.equal(svg.style.values.has('transform-origin'), false)
})

test('cancel restores the static state as fully as dispose', async () => {
  globalThis.matchMedia = () => ({ matches: false })
  const svg = createSvg()
  const controls = animateIcon(svg, 'heart', 'beat', { autoplay: true })

  controls.cancel()
  assert.equal(svg.animations[0].playState, 'idle')
  assert.equal(controls.progress(), 0)
})

test('an exit reverses playback instead of reversing the authored keyframes', () => {
  globalThis.matchMedia = () => ({ matches: false })
  const svg = createSvg()
  animateIcon(svg, 'bell', 'ring', { autoplay: true, direction: 'out' })

  const [animation] = svg.animations
  assert.deepEqual(animation.keyframes, resolveMotionRule('bell', 'ring').keyframes)
  assert.equal(animation.playbackRate, -1, 'an exit plays the entry animation backwards')
  assert.equal(animation.currentTime, 1000, 'an exit starts from the resting end state')
})

test('finish cancels looping animations so they do not hold a keyframe', async () => {
  globalThis.matchMedia = () => ({ matches: false })
  const svg = createSvg()
  const controls = animateIcon(svg, 'refresh', 'rotate', { autoplay: true, loop: true })
  assert.equal(svg.animations[0].timing.iterations, Number.POSITIVE_INFINITY)

  controls.finish()
  await settle()
  assert.equal(svg.animations[0].playState, 'idle')
})

test('an unavailable motion pairing warns and returns inert controls', () => {
  globalThis.matchMedia = () => ({ matches: false })
  const svg = createSvg()
  const warnings = []
  const originalWarn = console.warn
  console.warn = (message) => warnings.push(message)
  let controls
  try {
    controls = animateIcon(svg, 'heart', 'ring')
  } finally {
    console.warn = originalWarn
  }

  assert.equal(svg.animations.length, 0, 'no animation may touch an icon that has no matching rule')
  assert.equal(controls.progress(), 0)
  assert.doesNotThrow(() => { controls.play(); controls.reset(); controls.dispose() })
  assert.equal(warnings.length, 1)
  assert.match(warnings[0], /Motion "ring" is not available for icon "heart"/)
})

test('reduced motion replaces semantic loops with a short non-looping fade', () => {
  globalThis.matchMedia = () => ({ matches: true })
  const svg = createSvg()
  animateIcon(svg, 'refresh', 'rotate', { autoplay: true, loop: true })

  assert.deepEqual(svg.animations[0].keyframes, [{ opacity: 0 }, { opacity: 1 }])
  assert.equal(svg.animations[0].timing.duration, 100)
  assert.equal(svg.animations[0].timing.iterations, 1)
})

test('reducedMotion never keeps the authored rule even when the system asks to reduce', () => {
  globalThis.matchMedia = () => ({ matches: true })
  const svg = createSvg()
  animateIcon(svg, 'refresh', 'rotate', { autoplay: true, loop: true, reducedMotion: 'never' })

  assert.deepEqual(svg.animations[0].keyframes, resolveMotionRule('refresh', 'rotate').keyframes)
  assert.equal(svg.animations[0].timing.iterations, Number.POSITIVE_INFINITY)
})

test('reducedMotion always downgrades even when the system does not ask to reduce', () => {
  globalThis.matchMedia = () => ({ matches: false })
  const svg = createSvg()
  animateIcon(svg, 'bell', 'ring', { autoplay: true, reducedMotion: 'always' })

  assert.deepEqual(svg.animations[0].keyframes, [{ opacity: 0 }, { opacity: 1 }])
  assert.equal(svg.animations[0].timing.duration, 100)
})

test('a missing animate implementation degrades to inert controls', () => {
  globalThis.matchMedia = () => ({ matches: false })
  const controls = animateIcon({ animate: undefined, style: createStyle() }, 'bell', 'ring')
  assert.equal(controls.progress(), 0)
  assert.doesNotThrow(() => controls.play())
})
