import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react'
import { createPortal } from 'react-dom'

interface Rgb { b: number; g: number; r: number }
interface Hsl { h: number; l: number; s: number }
interface Hsv { h: number; s: number; v: number }
type ColorModel = 'hex' | 'rgb' | 'hsl'

interface PreviewColorPickerProps {
  label: string
  onChange: (value: string) => void
  value: string
}

const models: readonly ColorModel[] = ['hex', 'rgb', 'hsl']
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const channel = (value: number) => clamp(Math.round(value), 0, 255)
const toHex = (value: number) => channel(value).toString(16).padStart(2, '0').toUpperCase()
const rgbToHex = ({ r, g, b }: Rgb) => `#${toHex(r)}${toHex(g)}${toHex(b)}`
const normalizeHex = (value: string) => {
  const normalized = value.trim().toUpperCase()
  return /^#[0-9A-F]{6}$/.test(normalized) ? normalized : '#000000'
}
const hexToRgb = (value: string): Rgb => {
  const hex = normalizeHex(value).slice(1)
  return { r: Number.parseInt(hex.slice(0, 2), 16), g: Number.parseInt(hex.slice(2, 4), 16), b: Number.parseInt(hex.slice(4, 6), 16) }
}

function rgbToHsv({ r, g, b }: Rgb): Hsv {
  const red = r / 255
  const green = g / 255
  const blue = b / 255
  const max = Math.max(red, green, blue)
  const min = Math.min(red, green, blue)
  const delta = max - min
  let h = 0
  if (delta && max === red) h = 60 * (((green - blue) / delta) % 6)
  else if (delta && max === green) h = 60 * ((blue - red) / delta + 2)
  else if (delta) h = 60 * ((red - green) / delta + 4)
  return { h: Math.round((h + 360) % 360), s: max ? Math.round((delta / max) * 100) : 0, v: Math.round(max * 100) }
}

function hsvToRgb({ h, s, v }: Hsv): Rgb {
  const saturation = clamp(s, 0, 100) / 100
  const value = clamp(v, 0, 100) / 100
  const chroma = value * saturation
  const segment = ((h % 360) + 360) % 360 / 60
  const x = chroma * (1 - Math.abs((segment % 2) - 1))
  const [red, green, blue] = segment < 1 ? [chroma, x, 0]
    : segment < 2 ? [x, chroma, 0]
      : segment < 3 ? [0, chroma, x]
        : segment < 4 ? [0, x, chroma]
          : segment < 5 ? [x, 0, chroma]
            : [chroma, 0, x]
  const match = value - chroma
  return { r: (red + match) * 255, g: (green + match) * 255, b: (blue + match) * 255 }
}

function rgbToHsl({ r, g, b }: Rgb): Hsl {
  const red = r / 255
  const green = g / 255
  const blue = b / 255
  const max = Math.max(red, green, blue)
  const min = Math.min(red, green, blue)
  const delta = max - min
  const lightness = (max + min) / 2
  let h = 0
  if (delta && max === red) h = 60 * (((green - blue) / delta) % 6)
  else if (delta && max === green) h = 60 * ((blue - red) / delta + 2)
  else if (delta) h = 60 * ((red - green) / delta + 4)
  const saturation = delta ? delta / (1 - Math.abs(2 * lightness - 1)) : 0
  return { h: Math.round((h + 360) % 360), s: Math.round(saturation * 100), l: Math.round(lightness * 100) }
}

function hslToRgb({ h, s, l }: Hsl): Rgb {
  const saturation = clamp(s, 0, 100) / 100
  const lightness = clamp(l, 0, 100) / 100
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation
  const segment = ((h % 360) + 360) % 360 / 60
  const x = chroma * (1 - Math.abs((segment % 2) - 1))
  const [red, green, blue] = segment < 1 ? [chroma, x, 0]
    : segment < 2 ? [x, chroma, 0]
      : segment < 3 ? [0, chroma, x]
        : segment < 4 ? [0, x, chroma]
          : segment < 5 ? [x, 0, chroma]
            : [chroma, 0, x]
  const match = lightness - chroma / 2
  return { r: (red + match) * 255, g: (green + match) * 255, b: (blue + match) * 255 }
}

export function PreviewColorPicker({ label, onChange, value }: PreviewColorPickerProps) {
  const normalized = normalizeHex(value)
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState<{ left: number; top: number } | null>(null)
  const [model, setModel] = useState<ColorModel>('hex')
  const [hsv, setHsv] = useState(() => rgbToHsv(hexToRgb(normalized)))
  const [hexInput, setHexInput] = useState(normalized)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const svRef = useRef<HTMLDivElement>(null)
  const focusedPanelRef = useRef(false)

  useEffect(() => {
    setHexInput(normalized)
    setHsv(rgbToHsv(hexToRgb(normalized)))
  }, [normalized])

  useEffect(() => {
    if (!open) return
    const updatePosition = () => {
      const trigger = triggerRef.current
      if (!trigger) return
      const rect = trigger.getBoundingClientRect()
      const panelWidth = 272
      const panelHeight = 292
      const below = rect.bottom + 8
      setPosition({
        left: Math.max(12, Math.min(rect.left, window.innerWidth - panelWidth - 12)),
        top: below + panelHeight <= window.innerHeight - 12 ? below : Math.max(12, rect.top - panelHeight - 8),
      })
    }
    const closeOnOutsidePress = (event: MouseEvent) => {
      const target = event.target as Node
      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) return
      setOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.stopPropagation()
      setOpen(false)
      triggerRef.current?.focus()
    }
    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    document.addEventListener('mousedown', closeOnOutsidePress)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
      document.removeEventListener('mousedown', closeOnOutsidePress)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  useEffect(() => {
    if (!open || !position || focusedPanelRef.current) return
    panelRef.current?.querySelector<HTMLElement>('input, button')?.focus()
    focusedPanelRef.current = true
  }, [open, position])

  useEffect(() => {
    if (!open) focusedPanelRef.current = false
  }, [open])

  const commitHex = (nextValue: string) => {
    const next = nextValue.trim().toUpperCase()
    setHexInput(next)
    if (!/^#[0-9A-F]{6}$/.test(next)) return
    setHsv(rgbToHsv(hexToRgb(next)))
    onChange(next)
  }
  const commitHsv = (next: Hsv) => {
    const hex = rgbToHex(hsvToRgb(next))
    setHsv(next)
    setHexInput(hex)
    onChange(hex)
  }
  const pickSv = (clientX: number, clientY: number) => {
    const area = svRef.current
    if (!area) return
    const rect = area.getBoundingClientRect()
    commitHsv({
      h: hsv.h,
      s: Math.round(clamp((clientX - rect.left) / rect.width, 0, 1) * 100),
      v: Math.round((1 - clamp((clientY - rect.top) / rect.height, 0, 1)) * 100),
    })
  }
  const startSvDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault()
    pickSv(event.clientX, event.clientY)
    const move = (next: PointerEvent) => pickSv(next.clientX, next.clientY)
    const stop = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', stop)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', stop)
  }
  const trapPanelFocus = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab') return
    event.stopPropagation()
    const focusable = [...(panelRef.current?.querySelectorAll<HTMLElement>('button, input') ?? [])]
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last?.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first?.focus()
    }
  }

  const rgb = hexToRgb(normalized)
  const hsl = rgbToHsl(rgb)
  const panel = open && position ? createPortal(
    <div ref={panelRef} className="preview-color-picker" role="dialog" aria-label={label} style={{ position: 'fixed', ...position }} onKeyDown={trapPanelFocus}>
      <div
        ref={svRef}
        className="preview-color-picker-sv"
        style={{ backgroundColor: `hsl(${hsv.h} 100% 50%)` }}
        onPointerDown={startSvDrag}
      >
        <span className="preview-color-picker-sv-thumb" style={{ left: `${hsv.s}%`, top: `${100 - hsv.v}%` }} />
      </div>
      <input
        className="preview-color-picker-hue"
        type="range"
        min={0}
        max={360}
        value={hsv.h}
        aria-label={`${label} hue`}
        onChange={(event) => commitHsv({ ...hsv, h: Number(event.target.value) })}
      />
      <div className="preview-color-picker-models" role="tablist" aria-label="Color model">
        {models.map((item) => <button key={item} type="button" role="tab" aria-selected={model === item} className={model === item ? 'is-active' : ''} onClick={() => setModel(item)}>{item.toUpperCase()}</button>)}
      </div>
      <div className="preview-color-picker-values">
        <span className="preview-color-picker-value-swatch" style={{ backgroundColor: normalized }} aria-hidden="true" />
        {model === 'hex' && <input className="preview-color-picker-field is-hex" value={hexInput} aria-label={`${label} HEX`} aria-invalid={!/^#[0-9A-F]{6}$/.test(hexInput)} onChange={(event) => commitHex(event.target.value)} onBlur={() => commitHex(normalized)} />}
        {model === 'rgb' && (['r', 'g', 'b'] as const).map((key) => <label className="preview-color-picker-channel" key={key}><span>{key}</span><input className="preview-color-picker-field" type="number" min={0} max={255} value={rgb[key]} aria-label={`${label} ${key.toUpperCase()}`} onChange={(event) => onChange(rgbToHex({ ...rgb, [key]: channel(Number(event.target.value)) }))} /></label>)}
        {model === 'hsl' && (['h', 's', 'l'] as const).map((key) => <label className="preview-color-picker-channel" key={key}><span>{key}</span><input className="preview-color-picker-field" type="number" min={0} max={key === 'h' ? 360 : 100} value={hsl[key]} aria-label={`${label} ${key.toUpperCase()}`} onChange={(event) => onChange(rgbToHex(hslToRgb({ ...hsl, [key]: Number(event.target.value) })))} /></label>)}
      </div>
    </div>,
    document.body,
  ) : null

  return <>
    <button ref={triggerRef} className="preview-color-control" type="button" aria-label={label} aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen((current) => !current)}>
      <span className="preview-color-swatch" style={{ backgroundColor: normalized }} aria-hidden="true" />
    </button>
    {panel}
  </>
}
