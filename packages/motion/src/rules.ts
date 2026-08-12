import type { IconName } from '@uplus-icon/core'

export type GenericMotionName = 'fade' | 'scale' | 'blur'

export interface SemanticMotionMap {
  bell: 'ring'
  heart: 'beat'
  refresh: 'rotate'
}

export type SemanticMotionName = SemanticMotionMap[keyof SemanticMotionMap]
export type MotionName = GenericMotionName | SemanticMotionName
export type IconMotionName<Name extends IconName> = GenericMotionName | (Name extends keyof SemanticMotionMap ? SemanticMotionMap[Name] : never)

export interface MotionRule {
  duration: number
  easing: string
  keyframes: readonly Keyframe[]
  origin?: string
  target: 'icon' | 'stroke'
}

export const genericMotionRules = {
  fade: {
    duration: 1000,
    easing: 'cubic-bezier(.4, 0, .2, 1)',
    keyframes: [{ opacity: 0 }, { opacity: 1 }],
    target: 'icon',
  },
  scale: {
    duration: 1000,
    easing: 'cubic-bezier(.34, 1.56, .64, 1)',
    keyframes: [{ opacity: 0, transform: 'scale(.85)' }, { opacity: 1, transform: 'scale(1)' }],
    origin: '50% 50%',
    target: 'icon',
  },
  blur: {
    duration: 1000,
    easing: 'cubic-bezier(.4, 0, .2, 1)',
    keyframes: [{ opacity: 0, filter: 'blur(4px)' }, { opacity: 1, filter: 'blur(0)' }],
    target: 'icon',
  },
} as const satisfies Record<GenericMotionName, MotionRule>

export const semanticMotionRules = {
  bell: {
    ring: {
      duration: 1000,
      easing: 'cubic-bezier(.4, 0, .2, 1)',
      keyframes: [
        { transform: 'rotate(-12deg)' },
        { transform: 'rotate(11deg)' },
        { transform: 'rotate(-8deg)' },
        { transform: 'rotate(5deg)' },
        { transform: 'rotate(0deg)' },
      ],
      origin: '50% 12%',
      target: 'icon',
    },
  },
  heart: {
    beat: {
      duration: 1000,
      easing: 'cubic-bezier(.4, 0, .2, 1)',
      keyframes: [
        { transform: 'scale(1)' },
        { transform: 'scale(1.16)' },
        { transform: 'scale(.96)' },
        { transform: 'scale(1.1)' },
        { transform: 'scale(1)' },
      ],
      origin: '50% 50%',
      target: 'icon',
    },
  },
  refresh: {
    rotate: {
      duration: 1000,
      easing: 'linear',
      keyframes: [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }],
      origin: '50% 50%',
      target: 'icon',
    },
  },
} as const satisfies { [Name in keyof SemanticMotionMap]: Record<SemanticMotionMap[Name], MotionRule> }

export function resolveMotionRule(name: IconName, motion: MotionName): MotionRule | undefined {
  if (motion in genericMotionRules) return genericMotionRules[motion as GenericMotionName]
  const rules = semanticMotionRules[name as keyof SemanticMotionMap] as Partial<Record<SemanticMotionName, MotionRule>> | undefined
  return rules?.[motion as SemanticMotionName]
}
