import type { IconName } from '@uplus-icon/core'
import { resolveMotionRule, type MotionName, type MotionRule } from './rules.js'

export type MotionDirection = 'in' | 'out'
export type MotionEasing = 'standard' | 'linear' | 'ease-in' | 'ease-out'

export interface MotionOptions {
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

const prefersReducedMotion = (setting: MotionOptions['reducedMotion']) => setting === 'always' || (
  setting !== 'never' && typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
)

function reverseKeyframes(keyframes: readonly Keyframe[], direction: MotionDirection) {
  return direction === 'out' ? [...keyframes].reverse() : [...keyframes]
}

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

function createAnimation(
  target: Element,
  keyframes: Keyframe[] | PropertyIndexedKeyframes,
  timing: KeyframeAnimationOptions,
  autoplay: boolean,
) {
  if (typeof KeyframeEffect !== 'undefined' && typeof Animation !== 'undefined') {
    const animation = new Animation(new KeyframeEffect(target, keyframes, timing), document.timeline)
    animation.currentTime = 0
    if (autoplay) animation.play()
    else animation.pause()
    return animation
  }
  const animation = target.animate(keyframes, timing)
  if (!autoplay) {
    animation.pause()
    animation.currentTime = 0
    if (animation.playState !== 'paused' && animation.playState !== 'idle') {
      void animation.ready.then(() => {
        animation.pause()
        animation.currentTime = 0
      })
    }
  }
  return animation
}

function strokeKeyframes(length: number, direction: MotionDirection) {
  const hidden = `${length}`
  const visible = '0'
  return direction === 'out'
    ? [{ strokeDashoffset: visible }, { strokeDashoffset: hidden }]
    : [{ strokeDashoffset: hidden }, { strokeDashoffset: visible }]
}

function primeStrokePresentation(element: SVGGeometryElement, length: number, direction: MotionDirection) {
  const hidden = `${length}`
  const visible = '0'
  element.style.strokeDasharray = hidden
  element.style.strokeDashoffset = direction === 'out' ? visible : hidden
}

function strokeAnimations(
  svg: SVGSVGElement,
  rule: MotionRule,
  options: MotionOptions,
  reduced: boolean,
  autoplay: boolean,
) {
  ensureSvgLayout(svg)
  const timing = animationTiming(rule, options, reduced)
  const direction = options.direction ?? 'in'
  const elements = Array.from(svg.querySelectorAll<SVGGeometryElement>('path, circle, ellipse, rect, line, polyline, polygon'))
    .filter(hasDrawableStroke)
  const animations: Animation[] = []
  const strokeTargets: SVGGeometryElement[] = []
  for (const element of elements) {
    const length = readPathLength(element)
    if (!length) continue
    strokeTargets.push(element)
    primeStrokePresentation(element, length, direction)
    animations.push(createAnimation(element, strokeKeyframes(length, direction), timing, autoplay))
  }
  return { animations, strokeTargets, pendingStrokeElements: elements.length }
}

export function animateIcon(svg: SVGSVGElement, name: IconName, motion: MotionName, options: MotionOptions = {}): MotionControls {
  const rule = resolveMotionRule(name, motion)
  if (!rule) {
    console.warn(`[uplus-icon] Motion "${motion}" is not available for icon "${name}".`)
    return emptyControls
  }
  if (typeof svg.animate !== 'function') return emptyControls

  const reduced = prefersReducedMotion(options.reducedMotion ?? 'auto')
  const effectiveRule = reduced && motion !== 'fade'
    ? resolveMotionRule(name, 'fade')!
    : rule
  const timing = animationTiming(effectiveRule, options, reduced)
  const autoplay = options.autoplay ?? false
  let disposed = false
  let duration = Number(timing.duration) || 1
  let animations: Animation[] = []
  let strokeTargets: SVGGeometryElement[] = []

  const clearAnimations = () => {
    animations.forEach((animation) => animation.cancel())
    resetStrokePresentation(strokeTargets)
    animations = []
    strokeTargets = []
  }

  const presentationTarget = (options.animationTarget ?? svg) as HTMLElement | SVGSVGElement

  const mount = () => {
    clearAnimations()
    if (effectiveRule.origin) presentationTarget.style.transformOrigin = effectiveRule.origin

    if (effectiveRule.target === 'stroke') {
      const strokeResult = strokeAnimations(svg, effectiveRule, options, reduced, autoplay)
      animations = strokeResult.animations
      strokeTargets = strokeResult.strokeTargets
    } else {
      animations = [
        createAnimation(
          presentationTarget,
          reverseKeyframes(effectiveRule.keyframes, options.direction ?? 'in'),
          timing,
          autoplay,
        ),
      ]
    }

    if (!animations.length) {
      const fade = resolveMotionRule(name, 'fade')!
      animations = [
        createAnimation(
          presentationTarget,
          reverseKeyframes(fade.keyframes, options.direction ?? 'in'),
          animationTiming(fade, options, reduced),
          autoplay,
        ),
      ]
    }

    duration = Number(timing.duration) || 1
  }

  mount()

  if (effectiveRule.target === 'stroke') {
    const strokeElements = Array.from(svg.querySelectorAll<SVGGeometryElement>('path, circle, ellipse, rect, line, polyline, polygon'))
      .filter(hasDrawableStroke)
    if (strokeElements.length > 0 && animations.length === 0) {
      requestAnimationFrame(() => {
        if (disposed) return
        mount()
      })
    }
  }

  const clampProgress = (value: number) => Math.min(1, Math.max(0, value))
  const whenReady = (run: () => void) => {
    if (!animations.length) return
    void Promise.all(animations.map((animation) => animation.ready)).then(() => {
      if (!disposed) run()
    })
  }
  const setProgress = (progress: number) => {
    const time = clampProgress(progress) * duration
    for (const animation of animations) {
      animation.pause()
      animation.currentTime = time
    }
  }

  const controls: MotionControls = {
    cancel: () => animations.forEach((animation) => animation.cancel()),
    dispose: () => {
      disposed = true
      animations.forEach((animation) => animation.cancel())
      resetStrokePresentation(strokeTargets)
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
    play: () => whenReady(() => {
      animations.forEach((animation) => {
        const elapsed = Number(animation.currentTime ?? 0)
        if (animation.playState === 'finished' || elapsed >= duration) {
          animation.currentTime = 0
        }
        animation.playbackRate = 1
        animation.play()
      })
    }),
    playFrom: (progress, playback) => whenReady(() => {
      setProgress(progress)
      animations.forEach((animation) => {
        if (playback === 'backward') {
          animation.playbackRate = -1
          animation.play()
          return
        }
        animation.playbackRate = 1
        animation.play()
      })
    }),
    progress: () => {
      if (!animations.length) return 0
      const values = animations.map((animation) => {
        const elapsed = Number(animation.currentTime ?? 0)
        return timing.iterations === Infinity ? (elapsed % duration) / duration : elapsed / duration
      })
      return clampProgress(Math.max(...values))
    },
    reset: () => whenReady(() => {
      resetStrokePresentation(strokeTargets)
      if (effectiveRule.target === 'stroke') {
        const direction = options.direction ?? 'in'
        for (const element of strokeTargets) {
          const length = readPathLength(element)
          if (length) primeStrokePresentation(element, length, direction)
        }
      }
      setProgress(0)
    }),
    reverse: () => whenReady(() => {
      animations.forEach((animation) => {
        if (animation.currentTime === null || Number(animation.currentTime) === 0) animation.currentTime = duration
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
