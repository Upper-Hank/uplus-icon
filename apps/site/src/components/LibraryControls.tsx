import type { ReactNode } from 'react'
import { SlidingSurface } from './SlidingSurface'

export type SegmentedOption<T extends string> = {
  value: T
  label: string
  content: ReactNode
}

export function SegmentedControl<T extends string>({
  ariaLabel,
  className = '',
  onChange,
  options,
  value,
}: {
  ariaLabel: string
  className?: string
  onChange: (value: T) => void
  options: readonly SegmentedOption<T>[]
  value: T
}) {
  return (
    <SlidingSurface activeKey={value} className={`segmented-control ${className}`.trim()} role="group" ariaLabel={ariaLabel}>
      {options.map((option) => (
        <button
          className={option.value === value ? 'is-active' : undefined}
          type="button"
          aria-pressed={option.value === value}
          aria-label={option.label}
          title={option.label}
          data-motion="none"
          data-slide-key={option.value}
          onClick={() => onChange(option.value)}
          key={option.value}
        >
          {option.content}
        </button>
      ))}
    </SlidingSurface>
  )
}
