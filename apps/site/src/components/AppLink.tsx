import type { AnchorHTMLAttributes, MouseEvent } from 'react'

interface AppLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  navigate: (path: string) => void
  to: string
}

const isModifiedClick = (event: MouseEvent<HTMLAnchorElement>) =>
  event.metaKey || event.ctrlKey || event.shiftKey || event.altKey

/**
 * A real anchor that navigates through the client router on a plain left click.
 * Middle clicks, modifier clicks, and "open in new tab" keep native behavior, so
 * every in-app destination is a shareable URL.
 */
export function AppLink({ children, navigate, onClick, to, ...props }: AppLinkProps) {
  return (
    <a
      {...props}
      href={to}
      onClick={(event) => {
        onClick?.(event)
        if (event.defaultPrevented || event.button !== 0 || isModifiedClick(event)) return
        event.preventDefault()
        navigate(to)
      }}
    >
      {children}
    </a>
  )
}
