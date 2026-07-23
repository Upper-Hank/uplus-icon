import { useEffect, useState } from 'react'
import type { IconName } from '@uplus-icon/core'
import { iconMeta } from '@uplus-icon/core/metadata'
import type { DocSlug } from '../content/docs'

export type Route = { page: 'home' | 'icons' | 'changelog' } | { page: 'docs'; doc: DocSlug; mobileIndex: boolean } | { page: 'detail'; name: IconName }

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
  '/docs/web': 'web',
  '/docs/motion-api': 'motion-api',
  '/docs/motion-authoring': 'motion-authoring',
  '/docs/accessibility': 'accessibility',
  '/docs/testing': 'testing',
  '/docs/versioning': 'versioning',
  '/docs/contribution': 'contribution',
  '/docs/figma': 'figma',
  '/docs/package-architecture': 'package-architecture',
  '/docs/release-process': 'release-process',
}

function readRoute(): Route {
  const path = window.location.pathname.replace(/\/$/, '') || '/'
  if (path.startsWith('/icons/')) {
    const name = decodeURIComponent(path.slice(7)) as IconName
    if (iconMeta.some((icon) => icon.name === name)) return { page: 'detail', name }
  }
  if (path === '/icons') return { page: 'icons' }
  if (path === '/changelog') return { page: 'changelog' }
  if (path in docRoutes) return { page: 'docs', doc: docRoutes[path], mobileIndex: path === '/docs' }
  if (path.startsWith('/docs/')) return { page: 'docs', doc: 'principles', mobileIndex: false }
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
    if (window.location.pathname === path) return
    window.history.pushState({}, '', path)
    setRoute(readRoute())
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  return [route, navigate] as const
}
