export type UiIconName = 'grid' | 'list' | 'chevron-up' | 'chevron-down' | 'search' | 'sun' | 'moon'

interface UiIconProps {
  className?: string
  name: UiIconName
}

export function UiIcon({ className, name }: UiIconProps) {
  const commonProps = {
    className,
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    'aria-hidden': true,
  } as const

  if (name === 'grid') {
    return <svg {...commonProps}>
      <rect x="4" y="4" width="6" height="6" rx="2" stroke="currentColor" strokeWidth="2" />
      <rect x="14" y="4" width="6" height="6" rx="2" stroke="currentColor" strokeWidth="2" />
      <rect x="14" y="14" width="6" height="6" rx="2" stroke="currentColor" strokeWidth="2" />
      <rect x="4" y="14" width="6" height="6" rx="2" stroke="currentColor" strokeWidth="2" />
    </svg>
  }

  if (name === 'list') {
    return <svg {...commonProps} fill="currentColor">
      <rect x="9" y="6" width="12" height="2" rx="1" />
      <rect x="3" y="5.5" width="3" height="3" rx="1.5" />
      <rect x="9" y="11" width="12" height="2" rx="1" />
      <rect x="3" y="10.5" width="3" height="3" rx="1.5" />
      <rect x="9" y="16" width="12" height="2" rx="1" />
      <rect x="3" y="15.5" width="3" height="3" rx="1.5" />
    </svg>
  }

  if (name === 'chevron-up' || name === 'chevron-down') {
    return <svg {...commonProps}>
      <path
        d={name === 'chevron-up' ? 'M4 16L10.5858 9.41421C11.3668 8.63316 12.6332 8.63317 13.4142 9.41421L20 16' : 'M4 8L10.5858 14.5858C11.3668 15.3668 12.6332 15.3668 13.4142 14.5858L20 8'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  }

  if (name === 'search') {
    return <svg {...commonProps}>
      <circle cx="9.8995" cy="9.8995" r="7" stroke="currentColor" strokeWidth="2" />
      <rect x="13.639" y="15.053" width="2" height="6.99588" rx="1" transform="rotate(-45 13.639 15.053)" fill="currentColor" />
    </svg>
  }

  if (name === 'sun') {
    return <svg {...commonProps}>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <path d="M12 3V5M18.364 5.636L16.95 7.05M21 12H19M18.364 18.364L16.95 16.95M12 21V19M5.636 18.364L7.05 16.95M3 12H5M5.636 5.636L7.05 7.05" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  }

  return <svg {...commonProps}>
    <path d="M12 4C11.34 5.16 11 6.52 11 8C11 12.1 14.09 15.49 18.07 15.95C18.45 15.99 18.69 16.41 18.46 16.72C17 18.71 14.65 20 12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
  </svg>
}
