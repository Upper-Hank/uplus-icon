import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'

interface SwitchControlProps {
  checked: boolean
  label: string
  onChange: (value: boolean) => void
}

export function SwitchControl({ checked, label, onChange }: SwitchControlProps) {
  const thumbRef = useRef<HTMLSpanElement>(null)
  const readyRef = useRef(false)

  useLayoutEffect(() => {
    const thumb = thumbRef.current
    if (!thumb) return
    const x = checked ? 16 : 0
    if (!readyRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(thumb, { x })
      readyRef.current = true
      return
    }
    gsap.to(thumb, { x, duration: 0.18, ease: 'power2.out', overwrite: true })
    return () => { gsap.killTweensOf(thumb) }
  }, [checked])

  return (
    <button className="switch-control" type="button" role="switch" aria-checked={checked} data-motion="none" onClick={() => onChange(!checked)}>
      <span>{label}</span>
      <span className="switch-track" aria-hidden="true"><span className="switch-thumb" ref={thumbRef} /></span>
    </button>
  )
}
