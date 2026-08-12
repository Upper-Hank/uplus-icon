import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import type { IconDefinition } from '@uplus-icon/core'
import { animateIcon, type MotionControls, type MotionDirection, type MotionEasing, type MotionName } from '@uplus-icon/motion'
import { Icon, type IconName } from '@uplus-icon/react/dynamic'
import { releaseFeatures } from '../app/releaseFeatures'
import { useI18n } from '../i18n'
import { IconGuideOverlay } from './IconGuideOverlay'
import { MotionTimeline } from './MotionTimeline'
import { PreviewColorPicker } from './PreviewColorPicker'
import { IconSkeletonOverlay } from './IconSkeletonOverlay'
import { SegmentedControl } from './LibraryControls'
import { SelectMenu, type SelectMenuOption } from './SelectMenu'
import { SwitchControl } from './SwitchControl'

export type IconPreviewMode = 'master' | 'actual'
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

const defaultMotionDuration = 1
const semanticMotions = new Set<MotionName>(['ring', 'beat', 'rotate'])

const motionLabels = {
  zh: {
    blur: '模糊',
    fade: '淡化',
    beat: '心跳',
    ring: '摇铃',
    rotate: '旋转',
    scale: '缩放',
  },
  en: {
    blur: 'Blur',
    fade: 'Fade',
    beat: 'Beat',
    ring: 'Ring',
    rotate: 'Rotate',
    scale: 'Scale',
  },
} as const

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
  const [motionPreview, setMotionPreview] = useState(false)
  const [motionName, setMotionName] = useState<MotionName>('fade')
  const [motionDirection, setMotionDirection] = useState<MotionDirection>('in')
  const [motionEase, setMotionEase] = useState<MotionEasing>('standard')
  const [motionDuration, setMotionDuration] = useState(defaultMotionDuration)
  const [motionTime, setMotionTime] = useState(0)
  const [motionLoop, setMotionLoop] = useState(false)
  const [motionPlaying, setMotionPlaying] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [themeColor, setThemeColor] = useState(defaultPreviewColor)
  const motionTargetRef = useRef<SVGSVGElement>(null)
  const motionHostRef = useRef<HTMLDivElement>(null)
  const motionControlsRef = useRef<MotionControls | null>(null)
  const motionFrameRef = useRef(0)
  const motionPlayingRef = useRef(false)
  const motionTimeRef = useRef(0)
  const motionProgressRef = useRef(0)
  const motionMonitorRef = useRef(0)
  const isMaster = mode === 'master'
  const isMotionPreview = releaseFeatures.motion && motionPreview
  const modeOptions = [
    { value: 'master', label: language === 'zh' ? '母版检查' : 'Master inspection', content: language === 'zh' ? '母版' : 'Master' },
    { value: 'actual', label: language === 'zh' ? '实际尺寸' : 'Actual size', content: language === 'zh' ? '实际' : 'Actual' },
  ] as const
  const displayColor = color ?? themeColor
  const previewStyle = {
    color: displayColor,
    ...(mode === 'actual' ? { '--preview-actual-size': `${size}px` } : {}),
  } as CSSProperties
  const motionOptions = useMemo(() => {
    const generic: SelectMenuOption<MotionName>[] = (['fade', 'scale', 'blur'] as const).map((value) => ({
      value,
      label: motionLabels[language][value],
    }))
    const semantic = (motion?.semantic ?? [])
      .filter((value): value is Extract<MotionName, 'ring' | 'beat' | 'rotate'> => value === 'ring' || value === 'beat' || value === 'rotate')
      .map((value) => ({ value, label: motionLabels[language][value] }))
    return [...generic, ...semantic]
  }, [language, motion])
  const isSemanticMotion = semanticMotions.has(motionName)
  const motionEaseOptions: readonly SelectMenuOption<MotionEasing>[] = [
    { value: 'standard', label: language === 'zh' ? '标准' : 'Standard' },
    { value: 'linear', label: language === 'zh' ? '线性' : 'Linear' },
    { value: 'ease-in', label: language === 'zh' ? '渐入' : 'Ease in' },
    { value: 'ease-out', label: language === 'zh' ? '渐出' : 'Ease out' },
  ]

  useEffect(() => {
    if (motionOptions.some((option) => option.value === motionName)) return
    const firstSemantic = motionOptions.find((option) => semanticMotions.has(option.value))
    setMotionName(firstSemantic?.value ?? 'fade')
  }, [motionName, motionOptions])

  const previousMotionRef = useRef(motionName)
  const previousDirectionRef = useRef(motionDirection)
  const wasMotionPreviewRef = useRef(false)

  useEffect(() => {
    if (!releaseFeatures.motion) return
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  const syncMotionTimeline = useCallback((progress: number) => {
    const time = progress * motionDuration
    motionProgressRef.current = progress
    motionTimeRef.current = time
    setMotionTime(time)
  }, [motionDuration])

  const stopMotionMonitor = useCallback(() => {
    motionMonitorRef.current += 1
    cancelAnimationFrame(motionFrameRef.current)
  }, [])

  const monitorMotion = useCallback((looping = false) => {
    stopMotionMonitor()
    const session = motionMonitorRef.current

    const update = () => {
      if (session !== motionMonitorRef.current) return
      const controls = motionControlsRef.current
      const progress = controls?.progress() ?? motionProgressRef.current
      syncMotionTimeline(progress)
      if (!looping && progress >= 1) {
        syncMotionTimeline(1)
        motionPlayingRef.current = false
        setMotionPlaying(false)
        return
      }
      motionFrameRef.current = requestAnimationFrame(update)
    }
    motionFrameRef.current = requestAnimationFrame(update)
  }, [stopMotionMonitor, syncMotionTimeline])

  const monitorDirectionFlip = useCallback((startProgress: number) => {
    stopMotionMonitor()
    const session = motionMonitorRef.current
    const startWall = performance.now()

    const update = () => {
      if (session !== motionMonitorRef.current) return
      const elapsed = (performance.now() - startWall) / 1000
      const progress = Math.max(0, startProgress - elapsed / motionDuration)
      syncMotionTimeline(progress)
      if (progress <= 0) {
        motionControlsRef.current?.seek(0)
        motionControlsRef.current?.pause()
        motionPlayingRef.current = false
        setMotionPlaying(false)
        return
      }
      motionFrameRef.current = requestAnimationFrame(update)
    }
    motionFrameRef.current = requestAnimationFrame(update)
  }, [motionDuration, stopMotionMonitor, syncMotionTimeline])

  useEffect(() => {
    const root = document.documentElement
    const updateThemeColor = () => setThemeColor(defaultPreviewColor())
    const observer = new MutationObserver(updateThemeColor)
    observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  useLayoutEffect(() => {
    if (!isMotionPreview) {
      wasMotionPreviewRef.current = false
      motionPlayingRef.current = false
      motionProgressRef.current = 0
      setMotionPlaying(false)
      return
    }

    const host = motionHostRef.current
    const target = host?.querySelector('svg') ?? motionTargetRef.current
    if (!target) return

    const enteringMotionPreview = !wasMotionPreviewRef.current
    wasMotionPreviewRef.current = true

    const motionChanged = previousMotionRef.current !== motionName
    if (motionChanged) previousMotionRef.current = motionName

    const directionChanged = previousDirectionRef.current !== motionDirection
    if (directionChanged) previousDirectionRef.current = motionDirection

    const playReverse = directionChanged && !enteringMotionPreview && !motionChanged

    const previousProgress = motionChanged || enteringMotionPreview
      ? 0
      : motionProgressRef.current
    const shouldPlay = motionPlayingRef.current || enteringMotionPreview || motionChanged || playReverse
    if (shouldPlay) motionPlayingRef.current = true

    const controls = animateIcon(target, name, motionName, {
      animationTarget: showSkeleton && host ? host : undefined,
      autoplay: shouldPlay && !playReverse,
      direction: motionDirection,
      duration: motionDuration * 1000,
      easing: motionEase,
      loop: motionLoop,
    })
    motionControlsRef.current = controls
    motionProgressRef.current = previousProgress
    motionTimeRef.current = previousProgress * motionDuration
    setMotionTime(previousProgress * motionDuration)

    if (playReverse) {
      controls.playFrom(previousProgress, 'backward')
      monitorDirectionFlip(previousProgress)
    } else {
      if (!shouldPlay || previousProgress > 0) {
        controls.seek(previousProgress)
      }
      if (shouldPlay) {
        if (previousProgress > 0) controls.play()
        monitorMotion(motionLoop)
      }
    }
    setMotionPlaying(shouldPlay)

    return () => {
      stopMotionMonitor()
      controls.dispose()
      motionControlsRef.current = null
    }
  }, [absoluteWeight, isMotionPreview, mode, monitorDirectionFlip, monitorMotion, motionDirection, motionDuration, motionEase, motionLoop, motionName, name, showSkeleton, size, stopMotionMonitor, weight])

  const playMotion = () => {
    motionPlayingRef.current = true
    motionControlsRef.current?.play()
    setMotionPlaying(true)
    monitorMotion(motionLoop)
  }

  const pauseMotion = () => {
    motionPlayingRef.current = false
    motionControlsRef.current?.pause()
    stopMotionMonitor()
    setMotionPlaying(false)
  }

  const replayMotion = () => {
    motionPlayingRef.current = true
    motionControlsRef.current?.reset()
    motionControlsRef.current?.seek(0)
    motionControlsRef.current?.play()
    motionTimeRef.current = 0
    motionProgressRef.current = 0
    setMotionTime(0)
    setMotionPlaying(true)
    monitorMotion(motionLoop)
  }

  const seekMotion = (time: number) => {
    const progress = motionDuration > 0 ? time / motionDuration : 0
    motionControlsRef.current?.seek(progress)
    motionProgressRef.current = progress
    motionTimeRef.current = time
    setMotionTime(time)
  }

  const handleDurationChange = (nextDuration: number) => {
    const progress = motionProgressRef.current
    const nextTime = progress * nextDuration
    motionTimeRef.current = nextTime
    setMotionTime(nextTime)
    setMotionDuration(nextDuration)
  }

  const handleMotionPreviewChange = (enabled: boolean) => {
    setMotionPreview(enabled)
    if (enabled) motionPlayingRef.current = true
  }

  const resetPreview = () => {
    setShowGrid(false)
    setShowGuides(false)
    setShowSkeleton(false)
    onColorChange(null)
    if (releaseFeatures.motion) {
      stopMotionMonitor()
      motionControlsRef.current?.reset()
      motionPlayingRef.current = false
      setMotionPreview(false)
      setMotionName('fade')
      setMotionDirection('in')
      previousDirectionRef.current = 'in'
      setMotionEase('standard')
      setMotionDuration(defaultMotionDuration)
      setMotionLoop(false)
      setMotionPlaying(false)
      setMotionTime(0)
      motionTimeRef.current = 0
      motionProgressRef.current = 0
    }

    if (mode === 'actual') {
      onSizeChange(24)
      onAbsoluteWeightChange(false)
    }
    onWeightChange(2)
  }

  return (
    <section className={`detail-preview${isMotionPreview ? ' is-motion-preview' : ''}`} aria-label={language === 'zh' ? '图标预览与调试' : 'Icon preview and debugging'}>
      <div className="preview-canvas">
        <span className="preview-size-label">{isMaster
          ? (language === 'zh' ? '24 × 24 母版 · 放大至 256px' : '24 × 24 master · scaled to 256px')
          : `${size} × ${size}px`}</span>
        <div className={`preview-master${mode === 'actual' ? ' is-actual' : ''}${showSkeleton ? ' is-skeleton' : ''}`} style={previewStyle}>
          {showGrid && <svg className="preview-grid-svg" viewBox="0 0 24 24" shapeRendering="crispEdges" aria-hidden="true">
            <defs><pattern id="preview-unit-grid" width="1" height="1" patternUnits="userSpaceOnUse"><path d="M 1 0 H 0 V 1" fill="none" stroke="currentColor" strokeWidth="0.08" /></pattern></defs>
            <rect x="0.04" y="0.04" width="23.92" height="23.92" fill="url(#preview-unit-grid)" stroke="currentColor" strokeWidth="0.08" />
          </svg>}
          {showGuides && <IconGuideOverlay />}
          <div className={`preview-motion-target${isMotionPreview ? ' is-active' : ''}`}>
            <div ref={motionHostRef} className="preview-motion-layer">
              <Icon ref={motionTargetRef} className="preview-icon" name={name} size={mode === 'actual' ? size : '100%'} weight={weight} absoluteWeight={mode === 'actual' && absoluteWeight} />
            </div>
          </div>
          {showSkeleton && definition && <IconSkeletonOverlay definition={definition} />}
        </div>
        <div className="preview-canvas-inspection">
          <div className="preview-actions">
            <PreviewColorPicker label={language === 'zh' ? '选择图标预览颜色' : 'Choose icon preview color'} value={displayColor} onChange={onColorChange} />
            <button className="preview-toggle" type="button" aria-pressed={showGrid} onClick={() => setShowGrid((visible) => !visible)}><Icon name="grid" size={15} />{language === 'zh' ? '网格' : 'Grid'}</button>
            <button className="preview-toggle" type="button" aria-pressed={showGuides} onClick={() => setShowGuides((visible) => !visible)}><Icon name="compass" size={15} />{language === 'zh' ? '辅助线' : 'Guides'}</button>
            <button className="preview-toggle" type="button" aria-pressed={showSkeleton} disabled={!definition} onClick={() => setShowSkeleton((visible) => !visible)}><Icon name="anchor-point" size={15} />{language === 'zh' ? '骨骼' : 'Skeleton'}</button>
          </div>
        </div>
      </div>

      <aside className="preview-controls" aria-label={language === 'zh' ? '预览参数' : 'Preview parameters'}>
        <SegmentedControl ariaLabel={language === 'zh' ? '预览模式' : 'Preview mode'} className="preview-mode-control" options={modeOptions} value={mode} onChange={onModeChange} />

        <div className="preview-mode-summary">
          <div className="preview-mode-copy">
            <strong>{isMaster
              ? (language === 'zh' ? '母版检查' : 'Master inspection')
              : (language === 'zh' ? '实际尺寸' : 'Actual size')}</strong>
            <span>{isMaster
              ? (language === 'zh' ? '放大检查固定 24×24 源文件' : 'Enlarged inspection of the 24×24 source')
              : (language === 'zh' ? '按真实 CSS 像素渲染组件' : 'Rendered at its real CSS pixel size')}</span>
          </div>
          <button className="preview-reset" type="button" onClick={resetPreview}>{language === 'zh' ? '恢复默认' : 'Restore defaults'}</button>
        </div>

        {mode === 'actual' && <label className="preview-range-control">
          <span>{language === 'zh' ? '尺寸' : 'Size'}</span>
          <output>{Math.round(size)}px</output>
          <input type="range" min="12" max="256" step="1" value={size} style={rangeProgress(size, 12, 256)} onChange={(event) => onSizeChange(Number(event.target.value))} />
        </label>}

        <label className="preview-range-control">
          <span>{language === 'zh' ? '重量' : 'Weight'}</span>
          <output>{Number(weight.toFixed(2))}</output>
          <input type="range" min="0.5" max="2" step="0.25" value={weight} style={rangeProgress(weight, 0.5, 2)} onChange={(event) => onWeightChange(Number(event.target.value))} />
        </label>
        {mode === 'actual' && <SwitchControl checked={absoluteWeight} label={language === 'zh' ? '绝对重量' : 'Absolute weight'} onChange={onAbsoluteWeightChange} />}

        {releaseFeatures.motion && <section className="preview-motion-panel" aria-label={language === 'zh' ? '动画预览' : 'Motion preview'}>
          <SwitchControl
            checked={motionPreview}
            label={language === 'zh' ? '动画预览' : 'Motion preview'}
            onChange={handleMotionPreviewChange}
          />
          {motionPreview && <>
            <p className="preview-motion-hint">{language === 'zh' ? '动画叠加在当前预览上，不改写 SVG 真源' : 'Motion overlays the current preview without changing the SVG source'}</p>
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
              <MotionTimeline
                currentTime={motionTime}
                duration={motionDuration}
                language={language}
                looping={motionLoop}
                playing={motionPlaying}
                onDurationChange={handleDurationChange}
                onLoopChange={setMotionLoop}
                onPause={pauseMotion}
                onPlay={playMotion}
                onReplay={replayMotion}
                onSeek={seekMotion}
              />
            </div>
            {reducedMotion && <p className="preview-motion-notice">{language === 'zh' ? '系统已启用减少动态效果，预览降级为短淡入。' : 'Reduced Motion is enabled; preview falls back to a brief fade.'}</p>}
          </>}
        </section>}
      </aside>
    </section>
  )
}
