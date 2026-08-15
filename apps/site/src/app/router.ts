import { useEffect, useState } from 'react'
import type { IconName } from '@uplus-icon/core'
import { iconMeta } from '@uplus-icon/core/metadata'
import type { DocSlug } from '../content/docs'

export type Route =
  | { page: 'home' | 'icons' | 'guide' | 'changelog' | 'not-found' }
  | { page: 'docs'; doc: DocSlug; mobileIndex: boolean }
  | { page: 'detail'; name: IconName }

const docRoutes: Record<string, DocSlug> = {
  '/docs': 'principles',
  '/docs/principles': 'principles',
  '/docs/naming': 'naming',
  '/docs/canvas': 'canvas',
  '/docs/optical': 'optical',
  '/docs/stroke': 'stroke',
  '/docs/svg': 'svg',
  '/docs/metadata': 'metadata',
  '/docs/workflow': 'workflow',
  '/docs/api': 'api',
  '/docs/react': 'react',
  '/docs/accessibility': 'accessibility',
  '/docs/testing': 'testing',
  '/docs/versioning': 'versioning',
  '/docs/contribution': 'contribution',
  '/docs/figma': 'figma',
  '/docs/package-architecture': 'package-architecture',
  '/docs/release-process': 'release-process',
  '/docs/identity': 'identity',
}

export function resolveRoute(pathname: string): Route {
  const path = pathname.replace(/\/+$/, '') || '/'
  if (path.startsWith('/icons/')) {
    try {
      const name = decodeURIComponent(path.slice(7)) as IconName
      if (iconMeta.some((icon) => icon.name === name)) return { page: 'detail', name }
    } catch {
      return { page: 'not-found' }
    }
    return { page: 'not-found' }
  }
  if (path === '/icons') return { page: 'icons' }
  if (path === '/guide') return { page: 'guide' }
  if (path === '/changelog') return { page: 'changelog' }
  if (path in docRoutes) return { page: 'docs', doc: docRoutes[path], mobileIndex: path === '/docs' }
  if (path === '/') return { page: 'home' }
  return { page: 'not-found' }
}

function readRoute(): Route {
  return resolveRoute(window.location.pathname)
}

function preservesIconsScroll(from: Route, to: Route) {
  const onIconsSurface = (route: Route) => route.page === 'icons' || route.page === 'detail'
  return onIconsSurface(from) && onIconsSurface(to)
}

export function useRoute() {
  const [route, setRoute] = useState(readRoute)

  useEffect(() => {
    const onPopState = () => setRoute(readRoute())
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const navigate = (path: string) => {
    if (window.location.pathname === path) return
    const from = resolveRoute(window.location.pathname)
    const to = resolveRoute(path)
    window.history.pushState({}, '', path)
    setRoute(to)
    if (!preservesIconsScroll(from, to)) {
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
  }

  return [route, navigate] as const
}
