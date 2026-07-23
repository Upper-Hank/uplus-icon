import { useState, type CSSProperties } from 'react'
import type { IconDefinition } from '@uplus-icon/core'
import { Icon, type IconName } from '@uplus-icon/react/dynamic'
import { useI18n } from '../i18n'
import { IconSkeletonOverlay } from './IconSkeletonOverlay'
import { SegmentedControl } from './LibraryControls'
import { SwitchControl } from './SwitchControl'

export type IconPreviewMode = 'master' | 'actual'

interface IconDetailPreviewProps {
  absoluteStrokeWidth: boolean
  definition?: IconDefinition
  mode: IconPreviewMode
  name: IconName
  onAbsoluteStrokeWidthChange: (value: boolean) => void
  onModeChange: (value: IconPreviewMode) => void
  onSizeChange: (value: number) => void
  onStrokeWidthChange: (value: number) => void
  size: number
  strokeWidth: number
}

const rangeProgress = (value: number, min: number, max: number) => ({
  '--range-progress': `${((value - min) / (max - min)) * 100}%`,
}) as CSSProperties

export function IconDetailPreview({
  absoluteStrokeWidth,
  definition,
  mode,
  name,
  onAbsoluteStrokeWidthChange,
  onModeChange,
  onSizeChange,
  onStrokeWidthChange,
  size,
  strokeWidth,
}: IconDetailPreviewProps) {
  const { language } = useI18n()
  const [showGrid, setShowGrid] = useState(false)
  const [showSkeleton, setShowSkeleton] = useState(false)
  const isMaster = mode === 'master'
  const modeOptions = [
    { value: 'master', label: language === 'zh' ? '母版检查' : 'Master inspection', content: language === 'zh' ? '母版' : 'Master' },
    { value: 'actual', label: language === 'zh' ? '实际尺寸' : 'Actual size', content: language === 'zh' ? '实际' : 'Actual' },
  ] as const
  const actualStyle = isMaster ? undefined : { '--preview-actual-size': `${size}px` } as CSSProperties

  return (
    <section className="detail-preview" aria-label={language === 'zh' ? '图标预览与调试' : 'Icon preview and debugging'}>
      <div className="preview-canvas">
        <span className="preview-size-label">{isMaster ? `24 × 24 ${language === 'zh' ? '母版' : 'master'}` : `${size} × ${size}px`}</span>
        <div className={`preview-master${isMaster ? '' : ' is-actual'}${showSkeleton ? ' is-skeleton' : ''}`} style={actualStyle}>
          {showGrid && <svg className="preview-grid-svg" viewBox="0 0 24 24" shapeRendering="crispEdges" aria-hidden="true">
            <defs><pattern id="preview-unit-grid" width="1" height="1" patternUnits="userSpaceOnUse"><path d="M 1 0 H 0 V 1" fill="none" stroke="currentColor" strokeWidth="0.08" /></pattern></defs>
            <rect x="0.04" y="0.04" width="23.92" height="23.92" fill="url(#preview-unit-grid)" stroke="currentColor" strokeWidth="0.08" />
          </svg>}
          <Icon className="preview-icon" name={name} size="100%" strokeWidth={strokeWidth} absoluteStrokeWidth={!isMaster && absoluteStrokeWidth} />
          {showSkeleton && definition && <IconSkeletonOverlay definition={definition} />}
        </div>
      </div>

      <aside className="preview-controls" aria-label={language === 'zh' ? '预览参数' : 'Preview parameters'}>
        <SegmentedControl ariaLabel={language === 'zh' ? '预览模式' : 'Preview mode'} className="preview-mode-control" options={modeOptions} value={mode} onChange={onModeChange} />

        <div className="preview-inspection">
          <span>{language === 'zh' ? '检查层' : 'Inspection'}</span>
          <div className="preview-actions">
            <button className="preview-toggle" type="button" aria-pressed={showGrid} onClick={() => setShowGrid((visible) => !visible)}><Icon name="grid" size={15} />{language === 'zh' ? '网格' : 'Grid'}</button>
            <button className="preview-toggle" type="button" aria-pressed={showSkeleton} disabled={!definition} onClick={() => setShowSkeleton((visible) => !visible)}><Icon name="share" size={15} />{language === 'zh' ? '骨骼' : 'Skeleton'}</button>
          </div>
        </div>

        <div className="preview-mode-copy">
          <strong>{isMaster ? (language === 'zh' ? '母版检查' : 'Master inspection') : (language === 'zh' ? '实际尺寸' : 'Actual size')}</strong>
          <span>{isMaster
            ? (language === 'zh' ? '放大检查固定 24×24 源文件' : 'Enlarged inspection of the 24×24 source')
            : (language === 'zh' ? '按真实 CSS 像素渲染组件' : 'Rendered at its real CSS pixel size')}</span>
        </div>

        {!isMaster && <label className="preview-range-control">
          <span>{language === 'zh' ? '尺寸' : 'Size'}</span>
          <output>{size}px</output>
          <input type="range" min="12" max="96" step="1" value={size} style={rangeProgress(size, 12, 96)} onChange={(event) => onSizeChange(Number(event.target.value))} />
        </label>}

        <label className="preview-range-control">
          <span>{language === 'zh' ? '描边宽度' : 'Stroke width'}</span>
          <output>{strokeWidth}</output>
          <input type="range" min="0.5" max="2" step="0.25" value={strokeWidth} style={rangeProgress(strokeWidth, 0.5, 2)} onChange={(event) => onStrokeWidthChange(Number(event.target.value))} />
        </label>

        {!isMaster && <SwitchControl checked={absoluteStrokeWidth} label={language === 'zh' ? '绝对线宽' : 'Absolute stroke'} onChange={onAbsoluteStrokeWidthChange} />}
      </aside>
    </section>
  )
}
