import type { IconName } from '@uplus-icon/core'
import { Icon as StaticIcon, type IconProps as StaticIconProps } from '@uplus-icon/react/dynamic'
import { forwardRef, useCallback, useEffect, useRef, useState, type MouseEvent } from 'react'
import { animateIcon, REDUCED_MOTION_QUERY, type IconMotionName, type MotionControls, type MotionOptions } from './index.js'

export type MotionTrigger = 'manual' | 'mount' | 'hover' | 'click'

export interface IconProps<Name extends IconName = IconName> extends Omit<StaticIconProps, 'name' | 'direction'>, MotionOptions {
  name: Name
  motion?: IconMotionName<Name>
  trigger?: MotionTrigger
  onMotionReady?: (controls: MotionControls) => void
}

function MotionIcon<Name extends IconName>(
  {
    autoplay,
    direction,
    duration,
    easing,
    loop,
    motion,
    name,
    onClick,
    onMouseEnter,
    onMotionReady,
    reducedMotion,
    trigger = 'manual',
    ...props
  }: IconProps<Name>,
  forwardedRef: React.ForwardedRef<SVGSVGElement>,
) {
  const iconRef = useRef<SVGSVGElement | null>(null)
  const controlsRef = useRef<MotionControls | null>(null)
  const onMotionReadyRef = useRef(onMotionReady)
  onMotionReadyRef.current = onMotionReady

  const setRef = useCallback((node: SVGSVGElement | null) => {
    iconRef.current = node
    if (typeof forwardedRef === 'function') forwardedRef(node)
    else if (forwardedRef) forwardedRef.current = node
  }, [forwardedRef])

  // Rebuild the animation when the operating system motion preference changes so
  // the reduced-motion fallback applies without remounting the icon.
  const [motionPreference, setMotionPreference] = useState(0)
  useEffect(() => {
    if (reducedMotion === 'never' || reducedMotion === 'always') return
    if (typeof matchMedia !== 'function') return
    const query = matchMedia(REDUCED_MOTION_QUERY)
    const onChange = () => setMotionPreference((value) => value + 1)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [reducedMotion])

  useEffect(() => {
    const svg = iconRef.current
    if (!svg || !motion) return
    const controls = animateIcon(svg, name, motion, {
      autoplay: autoplay ?? trigger === 'mount', direction, duration, easing, loop, reducedMotion,
    })
    controlsRef.current = controls
    onMotionReadyRef.current?.(controls)

    return () => {
      controls.dispose()
      controlsRef.current = null
    }
  }, [autoplay, direction, duration, easing, loop, motion, motionPreference, name, reducedMotion, trigger])

  const handleMouseEnter = (event: MouseEvent<SVGSVGElement>) => {
    onMouseEnter?.(event)
    if (!event.defaultPrevented && trigger === 'hover') controlsRef.current?.play()
  }
  const handleClick = (event: MouseEvent<SVGSVGElement>) => {
    onClick?.(event)
    if (!event.defaultPrevented && trigger === 'click') controlsRef.current?.play()
  }

  return <StaticIcon {...props} ref={setRef} name={name} onClick={handleClick} onMouseEnter={handleMouseEnter} />
}

export const Icon = forwardRef(MotionIcon) as <Name extends IconName>(
  props: IconProps<Name> & { ref?: React.Ref<SVGSVGElement> },
) => React.ReactElement | null

export type { IconName, IconMotionName, MotionControls, MotionOptions }
