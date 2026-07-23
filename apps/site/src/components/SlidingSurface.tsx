import { useLayoutEffect, useRef, type ReactNode } from 'react'

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
      if (!active) {
        indicator.style.opacity = '0'
        return
      }
      indicator.style.transition = !readyRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'none'
        : 'width .22s cubic-bezier(.22, 1, .36, 1), transform .22s cubic-bezier(.22, 1, .36, 1), opacity .15s ease'
      indicator.style.width = `${active.offsetWidth}px`
      indicator.style.transform = `translateX(${active.offsetLeft}px)`
      indicator.style.opacity = '1'
      readyRef.current = true
    }

    update()
    const observer = new ResizeObserver(update)
    observer.observe(container)
    for (const item of container.querySelectorAll<HTMLElement>('[data-slide-key]')) observer.observe(item)
    return () => {
      observer.disconnect()
    }
  }, [activeKey])

  return (
    <div className={`sliding-surface ${className}`.trim()} ref={containerRef} role={role} aria-label={ariaLabel}>
      <span className="sliding-indicator" ref={indicatorRef} aria-hidden="true" />
      {children}
    </div>
  )
}
