import { useCallback, useEffect, useRef, type HTMLAttributes, type KeyboardEvent, type MouseEvent, type TouchEvent } from 'react'

const selector = 'button:not(:disabled):not([data-motion="none"]), a[href]:not([data-motion="none"]), summary:not([data-motion="none"])'

const findControl = (target: EventTarget | null) => target instanceof Element
  ? target.closest<HTMLElement>(selector)
  : null

type InteractionProps = Pick<HTMLAttributes<HTMLDivElement>,
  'onKeyDown' | 'onKeyUp' | 'onMouseDown' | 'onMouseOut' | 'onMouseUp' | 'onTouchCancel' | 'onTouchEnd' | 'onTouchStart'>

export function useInteractiveMotion(): InteractionProps {
  const animatedRef = useRef(new Set<HTMLElement>())
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const press = useCallback((control: HTMLElement, active: boolean) => {
    if (reducedMotion()) return
    animatedRef.current.add(control)
    control.style.transition = active
      ? 'transform .1s cubic-bezier(.4, 0, 1, 1)'
      : 'transform .2s cubic-bezier(.34, 1.56, .64, 1)'
    control.style.transform = active ? 'scale(.97)' : 'scale(1)'
  }, [])

  const onMouseOut = useCallback((event: MouseEvent<HTMLDivElement>) => {
    const control = findControl(event.target)
    if (!control || control.contains(event.relatedTarget as Node | null)) return
    press(control, false)
  }, [press])

  const onMouseDown = useCallback((event: MouseEvent<HTMLDivElement>) => {
    const control = findControl(event.target)
    if (control) press(control, true)
  }, [press])

  const onMouseUp = useCallback((event: MouseEvent<HTMLDivElement>) => {
    const control = findControl(event.target)
    if (control) press(control, false)
  }, [press])

  const onKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    const control = findControl(event.target)
    if (control && !event.repeat) press(control, true)
  }, [press])

  const onKeyUp = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    const control = findControl(event.target)
    if (control) press(control, false)
  }, [press])

  const onTouchStart = useCallback((event: TouchEvent<HTMLDivElement>) => {
    const control = findControl(event.target)
    if (control) press(control, true)
  }, [press])

  const onTouchEnd = useCallback((event: TouchEvent<HTMLDivElement>) => {
    const control = findControl(event.target)
    if (control) press(control, false)
  }, [press])

  useEffect(() => () => {
    const animated = [...animatedRef.current]
    if (animated.length === 0) return
    for (const control of animated) {
      control.style.removeProperty('transition')
      control.style.removeProperty('transform')
    }
  }, [])

  return {
    onKeyDown,
    onKeyUp,
    onMouseDown,
    onMouseOut,
    onMouseUp,
    onTouchCancel: onTouchEnd,
    onTouchEnd,
    onTouchStart,
  }
}
