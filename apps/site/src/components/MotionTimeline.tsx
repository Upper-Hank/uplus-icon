import { useCallback, useRef, type CSSProperties, type PointerEvent } from 'react'
import { Icon } from '@uplus-icon/react/dynamic'

interface MotionTimelineProps {
  currentTime: number
  duration: number
  language: 'zh' | 'en'
  looping: boolean
  playing: boolean
  onDurationChange: (duration: number) => void
  onLoopChange: (loop: boolean) => void
  onPause: () => void
  onPlay: () => void
  onReplay: () => void
  onSeek: (time: number) => void
}

const rangeProgress = (value: number, min: number, max: number) => ({
  '--range-progress': `${((value - min) / (max - min)) * 100}%`,
}) as CSSProperties

const formatTime = (seconds: number) => `${Math.max(0, seconds).toFixed(1)}s`

export function MotionTimeline({
  currentTime,
  duration,
  language,
  looping,
  playing,
  onDurationChange,
  onLoopChange,
  onPause,
  onPlay,
  onReplay,
  onSeek,
}: MotionTimelineProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const scrubbingRef = useRef(false)
  const progress = duration > 0 ? Math.min(1, Math.max(0, currentTime / duration)) : 0

  const seekFromClientX = useCallback((clientX: number) => {
    const track = trackRef.current
    if (!track || duration <= 0) return
    const rect = track.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    onSeek(ratio * duration)
  }, [duration, onSeek])

  const handleTrackPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.preventDefault()
    scrubbingRef.current = true
    event.currentTarget.setPointerCapture(event.pointerId)
    onPause()
    seekFromClientX(event.clientX)
  }

  const handleTrackPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!scrubbingRef.current) return
    seekFromClientX(event.clientX)
  }

  const handleTrackPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (!scrubbingRef.current) return
    scrubbingRef.current = false
    event.currentTarget.releasePointerCapture(event.pointerId)
  }

  return (
    <div className="motion-timeline">
      <div className="motion-timeline-track-wrap">
        <span className="motion-timeline-time" aria-hidden="true">{formatTime(currentTime)}</span>
        <div
          ref={trackRef}
          className="motion-timeline-track"
          role="slider"
          aria-label={language === 'zh' ? '动画时间轴' : 'Animation timeline'}
          aria-valuemin={0}
          aria-valuemax={duration}
          aria-valuenow={currentTime}
          aria-valuetext={`${currentTime.toFixed(1)} ${language === 'zh' ? '秒' : 'seconds'}`}
          onPointerDown={handleTrackPointerDown}
          onPointerMove={handleTrackPointerMove}
          onPointerUp={handleTrackPointerUp}
          onPointerCancel={handleTrackPointerUp}
        >
          <div className="motion-timeline-rail" />
          <div className="motion-timeline-fill" style={{ width: `${progress * 100}%` }} />
          <div className="motion-timeline-playhead" style={{ left: `${progress * 100}%` }} />
        </div>
        <span className="motion-timeline-time" aria-hidden="true">{formatTime(duration)}</span>
      </div>

      <div className="motion-timeline-toolbar">
        <div className="motion-timeline-transport" role="group" aria-label={language === 'zh' ? '动画播放控制' : 'Motion playback'}>
          <button
            type="button"
            className="motion-timeline-transport-primary"
            aria-label={playing ? (language === 'zh' ? '暂停' : 'Pause') : (language === 'zh' ? '播放' : 'Play')}
            onClick={playing ? onPause : onPlay}
          >
            <Icon name={playing ? 'pause' : 'play'} size={14} />
          </button>
          <button type="button" aria-label={language === 'zh' ? '重播' : 'Replay'} onClick={onReplay}>
            <Icon name="refresh" size={14} />
          </button>
        </div>
        <label className="motion-timeline-loop">
          <input type="checkbox" checked={looping} onChange={(event) => onLoopChange(event.target.checked)} />
          <span>{language === 'zh' ? '循环' : 'Loop'}</span>
        </label>
      </div>

      <label className="preview-range-control motion-timeline-duration">
        <span>{language === 'zh' ? '时长' : 'Duration'}</span>
        <output>{duration.toFixed(1)}s</output>
        <input
          type="range"
          min="0.2"
          max="2"
          step="0.1"
          value={duration}
          style={rangeProgress(duration, 0.2, 2)}
          onChange={(event) => onDurationChange(Number(event.target.value))}
        />
      </label>
    </div>
  )
}
