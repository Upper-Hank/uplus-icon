import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { gsap } from 'gsap'
import type { IconDefinition } from '@uplus-icon/core'
import { Icon, type IconName } from '@uplus-icon/react/dynamic'
import { releaseFeatures } from '../app/releaseFeatures'
import { useI18n } from '../i18n'
import { IconGuideOverlay } from './IconGuideOverlay'
import { PreviewColorPicker } from './PreviewColorPicker'
import { IconSkeletonOverlay } from './IconSkeletonOverlay'
import { SegmentedControl } from './LibraryControls'
import { SelectMenu, type SelectMenuOption } from './SelectMenu'
import { SwitchControl } from './SwitchControl'

export type IconPreviewMode = 'master' | 'actual' | 'motion'
type MotionDirection = 'in' | 'out'
type MotionEase = 'standard' | 'linear' | 'ease-in' | 'ease-out'
type MotionName = 'fade' | 'scale' | 'blur' | 'draw' | 'ring' | 'beat' | 'rotate'

interface IconMotionCapabilities {
  semantic: readonly string[]
}

interface IconDetailPreviewProps {
  absoluteWeight: boolean
  color: string | null
  definition?: IconDefinition
  mode: IconPreviewMode
  motion?: IconMotionCapabilities
  name: IconName
  onAbsoluteWeightChange: (value: boolean) => void
  onColorChange: (value: string | null) => void
  onModeChange: (value: IconPreviewMode) => void
  onSizeChange: (value: number) => void
  onWeightChange: (value: number) => void
  size: number
  weight: number
}

const rangeProgress = (value: number, min: number, max: number) => ({
  '--range-progress': `${((value - min) / (max - min)) * 100}%`,
}) as CSSProperties

const defaultPreviewColor = () => {
  if (typeof document === 'undefined') return '#000000'
  return getComputedStyle(document.documentElement).getPropertyValue('--ui-text').trim() || '#000000'
}

const motionLabels = {
  zh: {
    blur: '模糊',
    draw: '描绘',
    fade: '淡化',
    beat: '心跳',
    ring: '摇铃',
    rotate: '旋转',
    scale: '缩放',
  },
  en: {
    blur: 'Blur',
    draw: 'Draw',
    fade: 'Fade',
    beat: 'Beat',
    ring: 'Ring',
    rotate: 'Rotate',
    scale: 'Scale',
  },
} as const

function geometryLength(element: SVGGeometryElement) {
  try {
    return element.getTotalLength()
  } catch {
    return 0
  }
}

export function IconDetailPreview({
  absoluteWeight,
  color,
  definition,
  mode,
  motion,
  name,
  onAbsoluteWeightChange,
  onColorChange,
  onModeChange,
  onSizeChange,
  onWeightChange,
  size,
  weight,
}: IconDetailPreviewProps) {
  const { language } = useI18n()
  const [showGrid, setShowGrid] = useState(false)
  const [showGuides, setShowGuides] = useState(false)
  const [showSkeleton, setShowSkeleton] = useState(false)
  const [motionName, setMotionName] = useState<MotionName>('fade')
  const [motionDirection, setMotionDirection] = useState<MotionDirection>('in')
  const [motionEase, setMotionEase] = useState<MotionEase>('standard')
  const [motionDuration, setMotionDuration] = useState(0.8)
  const [motionLoop, setMotionLoop] = useState(false)
  const [motionPlaying, setMotionPlaying] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [themeColor, setThemeColor] = useState(defaultPreviewColor)
  const motionTargetRef = useRef<HTMLDivElement>(null)
  const motionPlayButtonRef = useRef<HTMLButtonElement>(null)
  const motionTimelineRef = useRef<gsap.core.Timeline | null>(null)
  const resetTweenRef = useRef<gsap.core.Tween | null>(null)
  const isMaster = mode === 'master'
  const isMotion = releaseFeatures.motion && mode === 'motion'
  const modeOptions = [
    { value: 'master', label: language === 'zh' ? '母版检查' : 'Master inspection', content: language === 'zh' ? '母版' : 'Master' },
    { value: 'actual', label: language === 'zh' ? '实际尺寸' : 'Actual size', content: language === 'zh' ? '实际' : 'Actual' },
    ...(releaseFeatures.motion
      ? [{ value: 'motion', label: language === 'zh' ? '动画预览' : 'Motion preview', content: language === 'zh' ? '动画' : 'Motion' } as const]
      : []),
  ] as const
  const displayColor = color ?? themeColor
  const previewStyle = {
    color: displayColor,
    ...(mode === 'actual' ? { '--preview-actual-size': `${size}px` } : {}),
  } as CSSProperties
  const motionOptions = useMemo(() => {
    const generic: SelectMenuOption<MotionName>[] = (['fade', 'scale', 'blur', 'draw'] as const).map((value) => ({
      value,
      label: motionLabels[language][value],
    }))
    const semantic = (motion?.semantic ?? [])
      .filter((value): value is Extract<MotionName, 'ring' | 'beat' | 'rotate'> => value === 'ring' || value === 'beat' || value === 'rotate')
      .map((value) => ({ value, label: motionLabels[language][value] }))
    return [...generic, ...semantic]
  }, [language, motion])
  const isSemanticMotion = motionName === 'ring' || motionName === 'beat' || motionName === 'rotate'
  const motionEaseOptions: readonly SelectMenuOption<MotionEase>[] = [
    { value: 'standard', label: language === 'zh' ? '标准' : 'Standard' },
    { value: 'linear', label: language === 'zh' ? '线性' : 'Linear' },
    { value: 'ease-in', label: language === 'zh' ? '渐入' : 'Ease in' },
    { value: 'ease-out', label: language === 'zh' ? '渐出' : 'Ease out' },
  ]

  useEffect(() => {
    if (motionOptions.some((option) => option.value === motionName)) return
    setMotionName('fade')
  }, [motionName, motionOptions])

  useEffect(() => {
    if (!releaseFeatures.motion) return
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    const root = document.documentElement
    const updateThemeColor = () => setThemeColor(defaultPreviewColor())
    const observer = new MutationObserver(updateThemeColor)
    observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  useEffect(() => () => {
    resetTweenRef.current?.kill()
  }, [])

  useLayoutEffect(() => {
    const target = motionTargetRef.current
    if (!target || !isMotion) return

    const timeline = gsap.timeline({
      paused: true,
      repeat: motionLoop && !reducedMotion ? -1 : 0,
      repeatDelay: motionLoop ? 0.28 : 0,
      onUpdate: () => {
        const progress = motionTimelineRef.current?.progress() ?? 0
        motionPlayButtonRef.current?.style.setProperty('--motion-progress', `${progress * 100}%`)
      },
      onComplete: () => {
        motionPlayButtonRef.current?.style.setProperty('--motion-progress', '100%')
        setMotionPlaying(false)
      },
      onReverseComplete: () => {
        motionPlayButtonRef.current?.style.setProperty('--motion-progress', '0%')
        setMotionPlaying(false)
      },
    })
    motionTimelineRef.current = timeline
    motionPlayButtonRef.current?.style.setProperty('--motion-progress', '0%')
    gsap.set(target, { clearProps: 'filter,opacity,transform' })
    const staleDrawTargets = target.querySelectorAll('[data-motion-draw]')
    if (staleDrawTargets.length) {
      gsap.set(staleDrawTargets, { clearProps: 'opacity,strokeDasharray,strokeDashoffset' })
    }

    const duration = reducedMotion ? Math.min(0.12, motionDuration) : motionDuration
    const from = motionDirection === 'in'
    const ease = motionEase === 'linear' ? 'none' : motionEase === 'ease-in' ? 'power2.in' : motionEase === 'ease-out' ? 'power2.out' : 'power2.inOut'
    if (reducedMotion && motionName !== 'fade') {
      timeline.fromTo(target, { opacity: 0.72 }, { opacity: 1, duration, ease: 'none' })
    } else if (motionName === 'fade') {
      timeline.fromTo(target, { opacity: from ? 0 : 1 }, { opacity: from ? 1 : 0, duration, ease })
    } else if (motionName === 'scale') {
      timeline.fromTo(target, { opacity: from ? 0 : 1, scale: from ? 0.72 : 1 }, {
        opacity: from ? 1 : 0,
        scale: from ? 1 : 0.72,
        duration,
        ease,
        transformOrigin: '50% 50%',
      })
    } else if (motionName === 'blur') {
      timeline.fromTo(target, { opacity: from ? 0 : 1, filter: `blur(${from ? 10 : 0}px)` }, {
        opacity: from ? 1 : 0,
        filter: `blur(${from ? 0 : 10}px)`,
        duration,
        ease,
      })
    } else if (motionName === 'draw') {
      const geometry = [...target.querySelectorAll<SVGGeometryElement>('path, circle, ellipse, rect, line, polyline, polygon')]
        .filter((element) => getComputedStyle(element).stroke !== 'none')
      geometry.forEach((element) => {
        const length = geometryLength(element)
        if (!length) return
        element.dataset.motionDraw = ''
        gsap.set(element, { strokeDasharray: length, strokeDashoffset: from ? length : 0 })
        timeline.to(element, { strokeDashoffset: from ? 0 : length, duration, ease }, 0)
      })
      if (!geometry.length) {
        timeline.fromTo(target, { opacity: from ? 0 : 1 }, { opacity: from ? 1 : 0, duration, ease })
      }
    } else if (motionName === 'ring') {
      timeline.fromTo(target, { rotation: -12 }, {
        keyframes: [{ rotation: 11 }, { rotation: -8 }, { rotation: 5 }, { rotation: 0 }],
        duration,
        ease,
        transformOrigin: '50% 12%',
      })
    } else if (motionName === 'beat') {
      timeline.fromTo(target, { scale: 1 }, {
        keyframes: [{ scale: 1.16 }, { scale: 0.96 }, { scale: 1.1 }, { scale: 1 }],
        duration,
        ease,
        transformOrigin: '50% 50%',
      })
    } else {
      timeline.fromTo(target, { rotation: 0 }, {
        rotation: 360,
        duration,
        ease,
        transformOrigin: '50% 50%',
      })
    }

    timeline.restart()
    setMotionPlaying(true)

    return () => {
      timeline.kill()
      motionTimelineRef.current = null
      motionPlayButtonRef.current?.style.setProperty('--motion-progress', '0%')
      gsap.set(target, { clearProps: 'filter,opacity,transform' })
      target.querySelectorAll('[data-motion-draw]').forEach((element) => {
        delete (element as SVGGeometryElement).dataset.motionDraw
        gsap.set(element, { clearProps: 'opacity,strokeDasharray,strokeDashoffset' })
      })
    }
  }, [isMotion, motionDirection, motionDuration, motionEase, motionLoop, motionName, reducedMotion])

  const playMotion = () => {
    const timeline = motionTimelineRef.current
    if (!timeline) return
    if (timeline.progress() === 1) timeline.restart()
    else timeline.play()
    setMotionPlaying(true)
  }

  const pauseMotion = () => {
    motionTimelineRef.current?.pause()
    setMotionPlaying(false)
  }

  const reverseMotion = () => {
    const timeline = motionTimelineRef.current
    if (!timeline) return
    if (timeline.progress() === 0) timeline.progress(1)
    timeline.reverse()
    setMotionPlaying(true)
  }

  const replayMotion = () => {
    motionTimelineRef.current?.restart()
    setMotionPlaying(true)
  }

  const resetPreview = () => {
    resetTweenRef.current?.kill()
    setShowGrid(false)
    setShowGuides(false)
    setShowSkeleton(false)
    onColorChange(null)
    if (isMotion) {
      motionTimelineRef.current?.pause(0)
      setMotionName('fade')
      setMotionDirection('in')
      setMotionEase('standard')
      setMotionDuration(0.8)
      setMotionLoop(false)
      setMotionPlaying(false)
      motionPlayButtonRef.current?.style.setProperty('--motion-progress', '0%')
    }

    const values = {
      motionDurationValue: motionDuration,
      previewSize: size,
      previewWeight: weight,
    }
    resetTweenRef.current = gsap.to(values, {
      duration: reducedMotion ? 0 : 0.32,
      ease: 'power2.out',
      motionDurationValue: isMotion ? 0.8 : motionDuration,
      previewSize: mode === 'actual' ? 24 : size,
      previewWeight: 2,
      onUpdate: () => {
        if (mode === 'actual') onSizeChange(values.previewSize)
        onWeightChange(values.previewWeight)
        if (isMotion) setMotionDuration(values.motionDurationValue)
      },
      onComplete: () => {
        if (mode === 'actual') {
          onSizeChange(24)
          onAbsoluteWeightChange(false)
        }
        onWeightChange(2)
        if (isMotion) setMotionDuration(0.8)
        resetTweenRef.current = null
      },
    })
  }

  return (
    <section className={`detail-preview${isMotion ? ' is-motion' : ''}`} aria-label={language === 'zh' ? '图标预览与调试' : 'Icon preview and debugging'}>
      <div className="preview-canvas">
        <span className="preview-size-label">{isMaster
          ? (language === 'zh' ? '24 × 24 母版 · 放大至 256px' : '24 × 24 master · scaled to 256px')
          : isMotion
            ? `24 × 24 ${language === 'zh' ? '动画预览' : 'motion'}`
            : `${size} × ${size}px`}</span>
        <div className={`preview-master${mode === 'actual' ? ' is-actual' : ''}${isMotion ? ' is-motion' : ''}${showSkeleton ? ' is-skeleton' : ''}`} style={previewStyle}>
          {showGrid && <svg className="preview-grid-svg" viewBox="0 0 24 24" shapeRendering="crispEdges" aria-hidden="true">
            <defs><pattern id="preview-unit-grid" width="1" height="1" patternUnits="userSpaceOnUse"><path d="M 1 0 H 0 V 1" fill="none" stroke="currentColor" strokeWidth="0.08" /></pattern></defs>
            <rect x="0.04" y="0.04" width="23.92" height="23.92" fill="url(#preview-unit-grid)" stroke="currentColor" strokeWidth="0.08" />
          </svg>}
          {showGuides && <IconGuideOverlay />}
          <div className="preview-motion-target" ref={motionTargetRef}>
            <Icon className="preview-icon" name={name} size={mode === 'actual' ? size : '100%'} weight={weight} absoluteWeight={mode === 'actual' && absoluteWeight} />
          </div>
          {showSkeleton && definition && <IconSkeletonOverlay definition={definition} />}
        </div>
        <div className="preview-canvas-inspection">
          <div className="preview-actions">
            <PreviewColorPicker label={language === 'zh' ? '选择图标预览颜色' : 'Choose icon preview color'} value={displayColor} onChange={onColorChange} />
            <button className="preview-toggle" type="button" aria-pressed={showGrid} onClick={() => setShowGrid((visible) => !visible)}><Icon name="grid" size={15} />{language === 'zh' ? '网格' : 'Grid'}</button>
            <button className="preview-toggle" type="button" aria-pressed={showGuides} onClick={() => setShowGuides((visible) => !visible)}><Icon name="compass" size={15} />{language === 'zh' ? '辅助线' : 'Guides'}</button>
            <button className="preview-toggle" type="button" aria-pressed={showSkeleton} disabled={!definition} onClick={() => setShowSkeleton((visible) => !visible)}><Icon name="share" size={15} />{language === 'zh' ? '骨骼' : 'Skeleton'}</button>
          </div>
        </div>
      </div>

      <aside className="preview-controls" aria-label={language === 'zh' ? '预览参数' : 'Preview parameters'}>
        <SegmentedControl ariaLabel={language === 'zh' ? '预览模式' : 'Preview mode'} className="preview-mode-control" options={modeOptions} value={mode} onChange={onModeChange} />

        <div className="preview-mode-summary">
          <div className="preview-mode-copy">
            <strong>{isMaster
              ? (language === 'zh' ? '母版检查' : 'Master inspection')
              : isMotion
                ? (language === 'zh' ? '动画预览' : 'Motion preview')
                : (language === 'zh' ? '实际尺寸' : 'Actual size')}</strong>
            <span>{isMaster
              ? (language === 'zh' ? '放大检查固定 24×24 源文件' : 'Enlarged inspection of the 24×24 source')
              : isMotion
                ? (language === 'zh' ? '预览最终动画效果，不改写 SVG 真源' : 'Preview the final motion without changing the SVG source')
              : (language === 'zh' ? '按真实 CSS 像素渲染组件' : 'Rendered at its real CSS pixel size')}</span>
          </div>
          <button className="preview-reset" type="button" onClick={resetPreview}>{language === 'zh' ? '恢复默认' : 'Restore defaults'}</button>
        </div>

        {mode === 'actual' && <label className="preview-range-control">
          <span>{language === 'zh' ? '尺寸' : 'Size'}</span>
          <output>{Math.round(size)}px</output>
          <input type="range" min="12" max="256" step="1" value={size} style={rangeProgress(size, 12, 256)} onChange={(event) => onSizeChange(Number(event.target.value))} />
        </label>}

        {isMotion && <>
          <div className="preview-motion-settings">
            <div className="preview-motion-option">
              <span>{language === 'zh' ? '动画效果' : 'Motion effect'}</span>
              <SelectMenu ariaLabel={language === 'zh' ? '选择动画效果' : 'Select motion effect'} options={motionOptions} value={motionName} onChange={setMotionName} />
            </div>
            <div className="preview-motion-option">
              <span>{language === 'zh' ? '缓动' : 'Easing'}</span>
              <SelectMenu ariaLabel={language === 'zh' ? '选择动画缓动' : 'Select motion easing'} options={motionEaseOptions} value={motionEase} onChange={setMotionEase} />
            </div>
          </div>
          {!isSemanticMotion && <SegmentedControl
            ariaLabel={language === 'zh' ? '动画方向' : 'Motion direction'}
            className="preview-direction-control"
            options={[
              { value: 'in', label: language === 'zh' ? '进入动画' : 'Enter motion', content: language === 'zh' ? '进入' : 'In' },
              { value: 'out', label: language === 'zh' ? '退出动画' : 'Exit motion', content: language === 'zh' ? '退出' : 'Out' },
            ]}
            value={motionDirection}
            onChange={setMotionDirection}
          />}
          <div className="preview-motion-ranges">
            <label className="preview-range-control">
              <span>{language === 'zh' ? '时长' : 'Duration'}</span>
              <output>{motionDuration.toFixed(1)}s</output>
              <input type="range" min="0.2" max="2" step="0.1" value={motionDuration} style={rangeProgress(motionDuration, 0.2, 2)} onChange={(event) => setMotionDuration(Number(event.target.value))} />
            </label>
            <label className="preview-range-control">
              <span>{language === 'zh' ? '重量' : 'Weight'}</span>
              <output>{Number(weight.toFixed(2))}</output>
              <input type="range" min="0.5" max="2" step="0.25" value={weight} style={rangeProgress(weight, 0.5, 2)} onChange={(event) => onWeightChange(Number(event.target.value))} />
            </label>
          </div>
          <div className="preview-motion-playback">
            <SwitchControl checked={motionLoop} label={language === 'zh' ? '循环播放' : 'Loop'} onChange={setMotionLoop} />
            <div className="preview-motion-actions" role="group" aria-label={language === 'zh' ? '动画播放控制' : 'Motion playback'}>
              <button className="preview-motion-play" ref={motionPlayButtonRef} type="button" onClick={motionPlaying ? pauseMotion : playMotion}>
                <span>{motionPlaying ? (language === 'zh' ? '暂停' : 'Pause') : (language === 'zh' ? '播放' : 'Play')}</span>
              </button>
              <button type="button" onClick={reverseMotion}>{language === 'zh' ? '反向' : 'Reverse'}</button>
              <button type="button" onClick={replayMotion}>{language === 'zh' ? '重播' : 'Replay'}</button>
            </div>
          </div>
          {reducedMotion && <p className="preview-motion-notice">{language === 'zh' ? '系统已启用减少动态效果，预览降级为短淡入。' : 'Reduced Motion is enabled; preview falls back to a brief fade.'}</p>}
        </>}

        {!isMotion && <label className="preview-range-control">
          <span>{language === 'zh' ? '重量' : 'Weight'}</span>
          <output>{Number(weight.toFixed(2))}</output>
          <input type="range" min="0.5" max="2" step="0.25" value={weight} style={rangeProgress(weight, 0.5, 2)} onChange={(event) => onWeightChange(Number(event.target.value))} />
        </label>}
        {mode === 'actual' && <SwitchControl checked={absoluteWeight} label={language === 'zh' ? '绝对重量' : 'Absolute weight'} onChange={onAbsoluteWeightChange} />}
      </aside>
    </section>
  )
}
