import { useEffect, useState } from 'react'
import type { IconName } from 'uplus-icon'
import { iconMeta } from 'uplus-icon/metadata'

export type Route = { page: 'home' | 'icons' | 'docs' } | { page: 'detail'; name: IconName }

function readRoute(): Route {
  const path = window.location.pathname.replace(/\/$/, '')
  if (path.startsWith('/icons/')) {
    const name = decodeURIComponent(path.slice(7)) as IconName
    if (iconMeta.some((icon) => icon.name === name)) return { page: 'detail', name }
  }
  if (path === '/icons') return { page: 'icons' }
  if (path === '/docs') return { page: 'docs' }
  return { page: 'home' }
}

export function useRoute() {
  const [route, setRoute] = useState(readRoute)

  useEffect(() => {
    const onPopState = () => setRoute(readRoute())
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const navigate = (path: string) => {
    window.history.pushState({}, '', path)
    setRoute(readRoute())
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return [route, navigate] as const
}
