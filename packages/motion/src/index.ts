import type { IconName } from '@uplus-icon/core'
import { resolveMotionRule, type MotionName, type MotionRule } from './rules.js'

export type MotionDirection = 'in' | 'out'
export type MotionEasing = 'standard' | 'linear' | 'ease-in' | 'ease-out'

export interface MotionOptions {
  /** Element that receives the animation. Defaults to the icon's own `<svg>`. */
  animationTarget?: Element
  autoplay?: boolean
  direction?: MotionDirection
  duration?: number
  easing?: MotionEasing
  loop?: boolean
  reducedMotion?: 'auto' | 'always' | 'never'
}

export interface MotionControls {
  cancel(): void
  dispose(): void
  finish(): void
  pause(): void
  play(): void
  playFrom(progress: number, playback: 'forward' | 'backward'): void
  progress(): number
  reset(): void
  reverse(): void
  seek(progress: number): void
}

const easingValues: Record<MotionEasing, string> = {
  standard: 'cubic-bezier(.4, 0, .2, 1)',
  linear: 'linear',
  'ease-in': 'cubic-bezier(.4, 0, 1, 1)',
  'ease-out': 'cubic-bezier(0, 0, .2, 1)',
}

const emptyControls: MotionControls = {
  cancel() {}, dispose() {}, finish() {}, pause() {}, play() {}, playFrom() {}, progress: () => 0, reset() {}, reverse() {}, seek() {},
}

export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

const prefersReducedMotion = (setting: MotionOptions['reducedMotion']) => setting === 'always' || (
  setting !== 'never' && typeof matchMedia === 'function' && matchMedia(REDUCED_MOTION_QUERY).matches
)

function animationTiming(rule: MotionRule, options: MotionOptions, reduced: boolean): KeyframeAnimationOptions {
  return {
    duration: reduced ? 100 : (options.duration ?? rule.duration),
    easing: reduced ? 'linear' : (options.easing ? easingValues[options.easing] : rule.easing),
    fill: 'both',
    iterations: options.loop && !reduced ? Infinity : 1,
  }
}

function hasDrawableStroke(element: SVGGeometryElement) {
  const attrStroke = element.getAttribute('stroke')
  if (attrStroke && attrStroke !== 'none') {
    const attrWidth = element.getAttribute('stroke-width')
    if (attrWidth && Number.parseFloat(attrWidth) <= 0) return false
    return true
  }
  const style = getComputedStyle(element)
  const stroke = style.stroke || ''
  if (!stroke || stroke === 'none') return false
  const width = Number.parseFloat(style.strokeWidth || '0')
  return Number.isFinite(width) && width > 0
}

function ensureSvgLayout(svg: SVGSVGElement) {
  if (typeof svg.getBoundingClientRect === 'function') svg.getBoundingClientRect()
  try { svg.getBBox() } catch { /* ignore */ }
}

function readPathLength(element: SVGGeometryElement) {
  try {
    element.getBBox()
    const length = element.getTotalLength()
    return Number.isFinite(length) ? length : 0
  } catch {
    return 0
  }
}

function resetStrokePresentation(elements: readonly SVGGeometryElement[]) {
  for (const element of elements) {
    element.style.removeProperty('stroke-dasharray')
    element.style.removeProperty('stroke-dashoffset')
  }
}

function primeStrokePresentation(element: SVGGeometryElement, length: number, direction: MotionDirection) {
  const hidden = `${length}`
  const visible = '0'
  element.style.strokeDasharray = hidden
  element.style.strokeDashoffset = direction === 'out' ? visible : hidden
}

/**
 * Creates a paused-at-idle animation. An idle animation applies no keyframes, so
 * an icon that has not been played yet renders exactly like the static icon.
 */
function createAnimation(
  target: Element,
  keyframes: Keyframe[] | PropertyIndexedKeyframes,
  timing: KeyframeAnimationOptions,
  autoplay: boolean,
  playbackRate: number,
  startTime: number,
) {
  const animation = typeof KeyframeEffect !== 'undefined' && typeof Animation !== 'undefined'
    ? new Animation(new KeyframeEffect(target, keyframes, timing), document.timeline)
    : target.animate(keyframes, timing)

  if (!autoplay) {
    animation.cancel()
    return animation
  }
  animation.currentTime = startTime
  animation.playbackRate = playbackRate
  animation.play()
  return animation
}

function strokeKeyframes(length: number) {
  return [{ strokeDashoffset: `${length}` }, { strokeDashoffset: '0' }]
}

export function animateIcon(svg: SVGSVGElement, name: IconName, motion: MotionName, options: MotionOptions = {}): MotionControls {
  const rule = resolveMotionRule(name, motion)
  if (!rule) {
    console.warn(`[uplus-icon] Motion "${motion}" is not available for icon "${name}".`)
    return emptyControls
  }
  if (typeof svg.animate !== 'function') return emptyControls

  const reduced = prefersReducedMotion(options.reducedMotion ?? 'auto')
  const effectiveRule = reduced && motion !== 'fade' ? resolveMotionRule(name, 'fade')! : rule
  const timing = animationTiming(effectiveRule, options, reduced)
  const autoplay = options.autoplay ?? false
  const direction: MotionDirection = options.direction ?? 'in'
  // An exit is the entry animation played backwards, so the authored keyframes
  // stay untouched and multi-step semantic motions reverse coherently.
  const playbackRate = direction === 'out' ? -1 : 1

  let disposed = false
  let duration = Number(timing.duration) || 1
  let animations: Animation[] = []
  let strokeTargets: SVGGeometryElement[] = []
  let strokeLengths = new Map<SVGGeometryElement, number>()

  const startTime = () => (playbackRate < 0 ? duration : 0)

  const clearStrokes = () => {
    resetStrokePresentation(strokeTargets)
  }

  const primeStrokes = () => {
    for (const element of strokeTargets) {
      const length = strokeLengths.get(element)
      if (length) primeStrokePresentation(element, length, direction)
    }
  }

  const clearAnimations = () => {
    animations.forEach((animation) => animation.cancel())
    clearStrokes()
    animations = []
    strokeTargets = []
    strokeLengths = new Map()
  }

  const presentationTarget = (options.animationTarget ?? svg) as HTMLElement | SVGSVGElement

  const mountStroke = () => {
    ensureSvgLayout(svg)
    const elements = Array.from(svg.querySelectorAll<SVGGeometryElement>('path, circle, ellipse, rect, line, polyline, polygon'))
      .filter(hasDrawableStroke)
    for (const element of elements) {
      const length = readPathLength(element)
      if (!length) continue
      strokeTargets.push(element)
      strokeLengths.set(element, length)
      animations.push(createAnimation(element, strokeKeyframes(length), timing, autoplay, playbackRate, playbackRate < 0 ? duration : 0))
    }
    if (autoplay) primeStrokes()
    return elements.length
  }

  const mountIcon = (mountedRule: MotionRule, mountedTiming: KeyframeAnimationOptions) => {
    animations = [createAnimation(
      presentationTarget,
      [...mountedRule.keyframes],
      mountedTiming,
      autoplay,
      playbackRate,
      playbackRate < 0 ? Number(mountedTiming.duration) || 1 : 0,
    )]
  }

  const mount = () => {
    clearAnimations()
    if (effectiveRule.origin) presentationTarget.style.transformOrigin = effectiveRule.origin

    let pendingStrokeElements = 0
    if (effectiveRule.target === 'stroke') pendingStrokeElements = mountStroke()
    else mountIcon(effectiveRule, timing)

    if (!animations.length) {
      const fade = resolveMotionRule(name, 'fade')!
      mountIcon(fade, animationTiming(fade, options, reduced))
    }

    duration = Number(timing.duration) || 1
    return pendingStrokeElements
  }

  const pendingStrokeElements = mount()

  if (effectiveRule.target === 'stroke' && pendingStrokeElements > 0 && strokeTargets.length === 0) {
    requestAnimationFrame(() => {
      if (disposed) return
      mount()
    })
  }

  const clampProgress = (value: number) => Math.min(1, Math.max(0, value))
  const whenReady = (run: () => void) => {
    if (!animations.length) return
    void Promise.all(animations.map((animation) => animation.ready)).then(() => {
      if (!disposed) run()
    })
  }
  const setProgress = (progress: number) => {
    primeStrokes()
    const time = clampProgress(progress) * duration
    for (const animation of animations) {
      animation.pause()
      animation.currentTime = time
    }
  }

  const rewindIfComplete = (animation: Animation, rate: number) => {
    if (animation.playState === 'idle' || animation.currentTime === null) {
      animation.currentTime = rate < 0 ? duration : 0
      return
    }
    const elapsed = Number(animation.currentTime)
    const complete = animation.playState === 'finished' || (rate < 0 ? elapsed <= 0 : elapsed >= duration)
    if (complete) animation.currentTime = rate < 0 ? duration : 0
  }

  const start = (rate: number) => {
    primeStrokes()
    animations.forEach((animation) => {
      rewindIfComplete(animation, rate)
      animation.playbackRate = rate
      animation.play()
    })
  }

  /** Returns the icon to its static appearance by leaving every animation idle. */
  const toStaticState = () => {
    animations.forEach((animation) => animation.cancel())
    clearStrokes()
  }

  const controls: MotionControls = {
    cancel: () => toStaticState(),
    dispose: () => {
      disposed = true
      toStaticState()
      presentationTarget.style.removeProperty('transform-origin')
    },
    finish: () => whenReady(() => {
      animations.forEach((animation) => {
        if (timing.iterations === Infinity) animation.cancel()
        else animation.finish()
      })
    }),
    pause: () => whenReady(() => {
      animations.forEach((animation) => animation.pause())
    }),
    play: () => whenReady(() => start(playbackRate)),
    playFrom: (progress, playback) => whenReady(() => {
      setProgress(progress)
      const rate = playback === 'backward' ? -1 : 1
      animations.forEach((animation) => {
        animation.playbackRate = rate
        animation.play()
      })
    }),
    progress: () => {
      if (!animations.length) return 0
      const values = animations.map((animation) => {
        if (animation.playState === 'idle' || animation.currentTime === null) return playbackRate < 0 ? 1 : 0
        const elapsed = Number(animation.currentTime)
        return timing.iterations === Infinity ? (elapsed % duration) / duration : elapsed / duration
      })
      return clampProgress(Math.max(...values))
    },
    reset: () => whenReady(() => toStaticState()),
    reverse: () => whenReady(() => {
      animations.forEach((animation) => {
        if (animation.playState === 'idle' || animation.currentTime === null) animation.currentTime = duration
        else if (Number(animation.currentTime) === 0) animation.currentTime = duration
        animation.reverse()
      })
    }),
    seek: (progress) => whenReady(() => setProgress(progress)),
  }
  return controls
}

export {
  genericMotionRules,
  resolveMotionRule,
  semanticMotionRules,
  type GenericMotionName,
  type IconMotionName,
  type MotionName,
  type MotionRule,
  type SemanticMotionMap,
  type SemanticMotionName,
} from './rules.js'
