import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { gsap } from 'gsap'

interface SlidingSurfaceProps {
  activeKey: string
  ariaLabel?: string
  children: ReactNode
  className?: string
  role?: string
}

export function SlidingSurface({ activeKey, ariaLabel, children, className = '', role }: SlidingSurfaceProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const indicatorRef = useRef<HTMLSpanElement>(null)
  const readyRef = useRef(false)

  useLayoutEffect(() => {
    const container = containerRef.current
    const indicator = indicatorRef.current
    if (!container || !indicator) return

    const update = () => {
      const active = [...container.querySelectorAll<HTMLElement>('[data-slide-key]')]
        .find((item) => item.dataset.slideKey === activeKey)
      if (!active) return
      const metrics = { width: active.offsetWidth, x: active.offsetLeft, opacity: 1 }
      if (!readyRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set(indicator, metrics)
        readyRef.current = true
        return
      }
      gsap.to(indicator, { ...metrics, duration: 0.22, ease: 'power2.out', overwrite: true })
    }

    update()
    const observer = new ResizeObserver(update)
    observer.observe(container)
    for (const item of container.querySelectorAll<HTMLElement>('[data-slide-key]')) observer.observe(item)
    return () => {
      observer.disconnect()
      gsap.killTweensOf(indicator)
    }
  }, [activeKey])

  return (
    <div className={`sliding-surface ${className}`.trim()} ref={containerRef} role={role} aria-label={ariaLabel}>
      <span className="sliding-indicator" ref={indicatorRef} aria-hidden="true" />
      {children}
    </div>
  )
}
