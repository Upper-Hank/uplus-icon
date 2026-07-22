import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { UiIcon } from './UiIcon'

export interface SelectMenuOption<T extends string> {
  label: string
  value: T
}

interface SelectMenuProps<T extends string> {
  ariaLabel: string
  onChange: (value: T) => void
  options: readonly SelectMenuOption<T>[]
  value: T
}

export function SelectMenu<T extends string>({ ariaLabel, onChange, options, value }: SelectMenuProps<T>) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listboxId = useId()
  const selectedIndex = Math.max(0, options.findIndex((option) => option.value === value))
  const selected = options[selectedIndex]

  useEffect(() => {
    if (!open) return
    const closeOnOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      triggerRef.current?.focus()
    }
    const frame = window.requestAnimationFrame(() => {
      rootRef.current?.querySelectorAll<HTMLButtonElement>('[role="option"]')[selectedIndex]?.focus()
    })
    document.addEventListener('pointerdown', closeOnOutside)
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      window.cancelAnimationFrame(frame)
      document.removeEventListener('pointerdown', closeOnOutside)
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [open, selectedIndex])

  const focusOption = (index: number) => {
    const items = rootRef.current?.querySelectorAll<HTMLButtonElement>('[role="option"]')
    if (!items?.length) return
    items[(index + items.length) % items.length]?.focus()
  }

  const moveFocus = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      focusOption(index + 1)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      focusOption(index - 1)
    } else if (event.key === 'Home') {
      event.preventDefault()
      focusOption(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      focusOption(options.length - 1)
    }
  }

  const select = (nextValue: T) => {
    onChange(nextValue)
    setOpen(false)
    triggerRef.current?.focus()
  }

  return (
    <div className="select-menu" ref={rootRef}>
      <button
        className="select-trigger"
        ref={triggerRef}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        data-motion="none"
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
          event.preventDefault()
          setOpen(true)
        }}
      >
        <span>{selected.label}</span>
        <UiIcon name={open ? 'chevron-up' : 'chevron-down'} />
      </button>
      {open && <div className="select-popover" id={listboxId} role="listbox" aria-label={ariaLabel}>
        {options.map((option, index) => (
          <button
            className="select-option"
            type="button"
            role="option"
            aria-selected={option.value === value}
            onClick={() => select(option.value)}
            onKeyDown={(event) => moveFocus(event, index)}
            key={option.value}
          >
            <span>{option.label}</span>
            {option.value === value && <span className="select-option-mark" aria-hidden="true" />}
          </button>
        ))}
      </div>}
    </div>
  )
}
