import assert from 'node:assert/strict'
import test from 'node:test'
import { animateIcon, resolveMotionRule } from '../../motion/dist/index.js'

class FakeAnimation {
  currentTime = 0
  playState = 'running'
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

const createSvg = (geometry = []) => {
  const animations = []
  return {
    animations,
    getBoundingClientRect: () => ({ width: 24, height: 24 }),
    getBBox: () => ({ x: 0, y: 0, width: 24, height: 24 }),
    style: {
      values: new Map(),
      set transformOrigin(value) { this.values.set('transform-origin', value) },
      removeProperty(name) { this.values.delete(name) },
    },
    animate(keyframes, timing) {
      const animation = new FakeAnimation(keyframes, timing)
      animations.push(animation)
      return animation
    },
    querySelectorAll() { return geometry },
  }
}

test('generic rules are shared while semantic rules are selected by icon name', () => {
  assert.equal(resolveMotionRule('user', 'fade')?.duration, 1000)
  assert.equal(resolveMotionRule('bell', 'ring')?.duration, 1000)
  assert.equal(resolveMotionRule('heart', 'ring'), undefined)
})

test('controls stay visually static by default and expose deterministic playback', async () => {
  globalThis.matchMedia = () => ({ matches: false })
  const svg = createSvg()
  const controls = animateIcon(svg, 'bell', 'ring')

  assert.equal(svg.animations.length, 1)
  assert.equal(svg.animations[0].playState, 'paused')
  controls.play()
  await new Promise((resolve) => setTimeout(resolve, 0))
  assert.equal(svg.animations[0].playState, 'running')
  controls.pause()
  await new Promise((resolve) => setTimeout(resolve, 0))
  assert.equal(svg.animations[0].playState, 'paused')
  controls.reverse()
  await new Promise((resolve) => setTimeout(resolve, 0))
  assert.equal(svg.animations[0].playbackRate, -1)
  controls.dispose()
  assert.equal(svg.animations[0].playState, 'idle')
})

test('reduced motion replaces semantic loops with a short non-looping fade', () => {
  globalThis.matchMedia = () => ({ matches: true })
  const svg = createSvg()
  animateIcon(svg, 'refresh', 'rotate', { autoplay: true, loop: true })

  assert.deepEqual(svg.animations[0].keyframes, [{ opacity: 0 }, { opacity: 1 }])
  assert.equal(svg.animations[0].timing.duration, 100)
  assert.equal(svg.animations[0].timing.iterations, 1)
})
