import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { Icon, type IconName } from '@uplus-icon/react/dynamic'
import { iconMeta } from '@uplus-icon/core/metadata'
import { I18nProvider, useI18n, type Language } from './i18n'
import { copyText } from './app/copyText'
import { currentVersionLabel } from './app/releaseInfo'
import { useRoute } from './app/router'
import { useDocumentMetadata } from './app/useDocumentMetadata'
import { useInteractiveMotion } from './app/useInteractiveMotion'
import { Header } from './components/SiteChrome'

const DocumentationShell = lazy(() => import('./components/DocumentationShell').then((module) => ({ default: module.DocumentationShell })))
const IconsPage = lazy(() => import('./pages/IconsPage').then((module) => ({ default: module.IconsPage })))
const DocsContent = lazy(() => import('./pages/DocsPage').then((module) => ({ default: module.DocsContent })))
const GuideContent = lazy(() => import('./pages/GuidePage').then((module) => ({ default: module.GuideContent })))
const ChangelogContent = lazy(() => import('./pages/ChangelogPage').then((module) => ({ default: module.ChangelogContent })))

function getInitialLanguage(): Language {
  const saved = localStorage.getItem('uplus-language')
  if (saved === 'en' || saved === 'zh') return saved
  return navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en'
}

export function App() {
  const interactionProps = useInteractiveMotion()
  const [route, navigate] = useRoute()
  const mainRef = useRef<HTMLElement>(null)
  const [language, setLanguage] = useState<Language>(getInitialLanguage)
  useDocumentMetadata(route, language)
  const routeMotionKey = route.page === 'detail'
    ? 'icons'
    : route.page === 'docs'
      ? `docs:${route.doc}`
      : route.page

  useEffect(() => {
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en'
    localStorage.setItem('uplus-language', language)
  }, [language])

  useEffect(() => {
    const syncLanguage = (event: StorageEvent) => {
      if (event.key !== 'uplus-language') return
      if (event.newValue === 'en' || event.newValue === 'zh') {
        setLanguage(event.newValue)
      } else {
        setLanguage(navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en')
      }
    }
    window.addEventListener('storage', syncLanguage)
    return () => window.removeEventListener('storage', syncLanguage)
  }, [])

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const animations = [...(mainRef.current?.querySelectorAll<HTMLElement>('[data-reveal]') ?? [])]
      .map((element, index) => element.animate(
        [{ transform: 'translateY(20px)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }],
        { duration: 750, delay: index * 60, easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'backwards' },
      ))
    return () => animations.forEach((animation) => animation.cancel())
  }, [routeMotionKey])

  return <I18nProvider value={{ language, setLanguage }}>
    <div className="shell" {...interactionProps}>
      <Header route={route} navigate={navigate} />
      <main ref={mainRef}>
        <Suspense fallback={<div className="route-loading" role="status">{language === 'zh' ? '正在加载…' : 'Loading…'}</div>}>
          {route.page === 'home' && <Home navigate={navigate} />}
          {(route.page === 'icons' || route.page === 'detail') && (
            <IconsPage navigate={navigate} selectedIcon={route.page === 'detail' ? route.name : undefined} />
          )}
          {(route.page === 'docs' || route.page === 'guide' || route.page === 'changelog') && (
            <DocumentationShell
              active={route.page === 'docs' ? route.doc : route.page}
              mobileIndex={route.page === 'docs' && route.mobileIndex}
              navigate={navigate}
            >
              {route.page === 'docs'
                ? <DocsContent doc={route.doc} navigate={navigate} />
                : route.page === 'guide'
                  ? <GuideContent navigate={navigate} />
                  : <ChangelogContent />}
            </DocumentationShell>
          )}
          {route.page === 'not-found' && <NotFound navigate={navigate} />}
        </Suspense>
      </main>
    </div>
  </I18nProvider>
}

function Home({ navigate }: { navigate: (path: string) => void }) {
  const { language, t } = useI18n()
  const [copied, setCopied] = useState(false)
  const [copyFailed, setCopyFailed] = useState(false)
  const copyTimerRef = useRef<number | undefined>(undefined)
  const installCommand = 'npm install @uplus-icon/react'

  useEffect(() => () => window.clearTimeout(copyTimerRef.current), [])

  const copyInstall = async () => {
    const success = await copyText(installCommand)
    setCopied(success)
    setCopyFailed(!success)
    window.clearTimeout(copyTimerRef.current)
    copyTimerRef.current = window.setTimeout(() => {
      setCopied(false)
      setCopyFailed(false)
    }, 1600)
  }

  const moveExploreArrow = (button: HTMLButtonElement, x: number) => {
    const arrow = button.querySelector('svg')
    if (!arrow) return
    arrow.style.transition = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'none'
      : 'transform .2s cubic-bezier(.22, 1, .36, 1)'
    arrow.style.transform = `translateX(${x}px)`
  }

  return (
    <section className="home-hero">
      <div className="home-hero-layout">
        <div className="home-hero-content">
          <h1 data-reveal>{t('heroTitle')}</h1>
          <p className="home-intro" data-reveal>{t('heroIntro')}</p>
          <button className="home-release" type="button" onClick={() => navigate('/changelog')} data-reveal>
            <span>{language === 'zh' ? '公开 Beta' : 'Public Beta'}</span>
            <strong>{currentVersionLabel}</strong>
          </button>
          <div className="home-install" data-reveal>
            <div className="install-command">
              <span>npm</span>
              <code>{installCommand}</code>
              <button
                className={copied ? 'is-copied' : undefined}
                type="button"
                onClick={copyInstall}
                aria-label={copyFailed ? (language === 'zh' ? '复制失败' : 'Copy failed') : copied ? t('copied') : 'Copy install command'}
              >
                <span className="install-copy-icon" aria-hidden="true">
                  <Icon className="install-copy-default" name="copy" size={17} />
                  <Icon className="install-copy-success" name="check" size={17} />
                </span>
              </button>
            </div>
            <button
              className="explore-link"
              type="button"
              onClick={() => navigate('/icons')}
              onPointerEnter={(event) => moveExploreArrow(event.currentTarget, 3)}
              onPointerLeave={(event) => moveExploreArrow(event.currentTarget, 0)}
              onFocus={(event) => moveExploreArrow(event.currentTarget, 3)}
              onBlur={(event) => moveExploreArrow(event.currentTarget, 0)}
            >
              {t('explore')} <Icon name="arrow-right" size={17} />
            </button>
          </div>
        </div>

        <div className="home-visual" data-reveal>
          <div className="home-visual-header">
            <span>{language === 'zh' ? '实时图标场' : 'Live icon field'}</span>
            <span>{t('clickAnywhere')}</span>
          </div>
          <div className="home-physics"><PhysicsShowcase /></div>
        </div>
      </div>
    </section>
  )
}

function NotFound({ navigate }: { navigate: (path: string) => void }) {
  const { language } = useI18n()
  return (
    <section className="not-found" data-reveal>
      <p>404</p>
      <h1>{language === 'zh' ? '页面不存在' : 'Page not found'}</h1>
      <span>{language === 'zh' ? '这个地址可能已变更，或者从未存在。' : 'This address may have changed or never existed.'}</span>
      <div>
        <button type="button" onClick={() => navigate('/')}>{language === 'zh' ? '返回首页' : 'Go home'}</button>
        <button type="button" onClick={() => navigate('/icons')}>{language === 'zh' ? '浏览图标' : 'Browse icons'}</button>
      </div>
    </section>
  )
}

type Particle = {
  active: boolean
  retiring: boolean
  supported: boolean
  x: number
  y: number
  vx: number
  vy: number
  angle: number
  angularVelocity: number
}

const particleIcons: IconName[] = iconMeta.map(({ name }) => name as IconName)

function PhysicsShowcase() {
  const boxRef = useRef<HTMLDivElement>(null)
  const nodesRef = useRef<(HTMLSpanElement | null)[]>([])
  const particlesRef = useRef<Particle[]>(particleIcons.map(() => ({
    active: false, retiring: false, supported: false, x: 0, y: 0, vx: 0, vy: 0, angle: 0, angularVelocity: 0,
  })))
  const queueRef = useRef<number[]>([])
  const dragRef = useRef<{ index: number; pointerId: number; startX: number; startY: number; lastX: number; lastY: number; lastTime: number; dragging: boolean } | null>(null)

  useEffect(() => {
    let frame = 0
    let previous = performance.now()
    const radius = 20
    const box = boxRef.current
    if (box) {
      const initialPositions = box.clientWidth < 680
        ? [[0.16, 0.15], [0.84, 0.18], [0.1, 0.72], [0.9, 0.68], [0.28, 0.9], [0.72, 0.88]]
        : [[0.1, 0.16], [0.23, 0.1], [0.77, 0.12], [0.9, 0.18], [0.08, 0.5], [0.92, 0.48], [0.12, 0.78], [0.3, 0.9], [0.7, 0.88], [0.88, 0.76]]
      initialPositions.forEach(([x, y], index) => {
        const particle = particlesRef.current[index]
        particle.active = true
        particle.x = box.clientWidth * x
        particle.y = box.clientHeight * y
        particle.vx = (Math.random() - 0.5) * 0.6
        particle.vy = (Math.random() - 0.5) * 0.4
        particle.angle = Math.random() * 20 - 10
        particle.angularVelocity = (Math.random() - 0.5) * 0.5
        queueRef.current.push(index)
      })
    }

    const tick = (now: number) => {
      const box = boxRef.current
      if (!box) return
      const dt = Math.min((now - previous) / 16.667, 2)
      previous = now
      const width = box.clientWidth
      const height = box.clientHeight
      const cornerRadius = parseFloat(getComputedStyle(box).borderTopLeftRadius) || 0
      const particles = particlesRef.current
      const draggedIndex = dragRef.current?.dragging ? dragRef.current.index : -1

      for (const [index, particle] of particles.entries()) {
        if (!particle.active) continue
        if (index === draggedIndex) continue
        particle.supported = false
        particle.vy += 0.42 * dt
        particle.vx *= Math.pow(0.995, dt)
        particle.vy *= Math.pow(0.998, dt)
        particle.x += particle.vx * dt
        particle.y += particle.vy * dt
        particle.angle += particle.angularVelocity * dt

        if (particle.x < radius) { particle.x = radius; particle.vx = Math.abs(particle.vx) * 0.68 }
        if (particle.x > width - radius) { particle.x = width - radius; particle.vx = -Math.abs(particle.vx) * 0.68 }
        if (particle.y < radius) { particle.y = radius; particle.vy = Math.abs(particle.vy) * 0.55 }
        if (particle.y > height - radius) {
          particle.y = height - radius
          particle.supported = true
          particle.vy = -Math.abs(particle.vy) * 0.48
          particle.vx *= 0.92
          particle.angularVelocity *= 0.9
          if (Math.abs(particle.vy) < 0.7) particle.vy = 0
        }

        const innerCornerRadius = Math.max(0, cornerRadius - radius)
        if (innerCornerRadius > 0) {
          const cornerX = particle.x < cornerRadius ? cornerRadius : particle.x > width - cornerRadius ? width - cornerRadius : null
          const cornerY = particle.y < cornerRadius ? cornerRadius : particle.y > height - cornerRadius ? height - cornerRadius : null
          if (cornerX !== null && cornerY !== null) {
            const dx = particle.x - cornerX
            const dy = particle.y - cornerY
            const distance = Math.hypot(dx, dy) || 0.01
            if (distance > innerCornerRadius) {
              const nx = dx / distance
              const ny = dy / distance
              particle.x = cornerX + nx * innerCornerRadius
              particle.y = cornerY + ny * innerCornerRadius
              const outwardVelocity = particle.vx * nx + particle.vy * ny
              if (outwardVelocity > 0) {
                particle.vx -= outwardVelocity * nx * 1.55
                particle.vy -= outwardVelocity * ny * 1.55
              }
            }
          }
        }
      }

      const active = particles.filter((particle) => particle.active)
      for (let i = 0; i < active.length; i += 1) {
        for (let j = i + 1; j < active.length; j += 1) {
          const a = active[i]
          const b = active[j]
          const aIndex = particles.indexOf(a)
          const bIndex = particles.indexOf(b)
          const dx = b.x - a.x
          const dy = b.y - a.y
          const distance = Math.hypot(dx, dy) || 0.01
          const overlap = radius * 2 - distance
          if (overlap <= 0) continue
          const nx = dx / distance
          const ny = dy / distance
          const aWeight = aIndex === draggedIndex ? 0 : bIndex === draggedIndex ? 1 : 0.5
          const bWeight = bIndex === draggedIndex ? 0 : aIndex === draggedIndex ? 1 : 0.5
          a.x -= nx * overlap * aWeight
          a.y -= ny * overlap * aWeight
          b.x += nx * overlap * bWeight
          b.y += ny * overlap * bWeight
          const relativeVelocity = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny
          if (relativeVelocity < 0) {
            const impulse = -(1.45 * relativeVelocity) / 2
            if (aIndex !== draggedIndex) { a.vx -= impulse * nx; a.vy -= impulse * ny }
            if (bIndex !== draggedIndex) { b.vx += impulse * nx; b.vy += impulse * ny }
          }
          if (ny < -0.45) b.supported = true
          if (ny > 0.45) a.supported = true
        }
      }

      for (const particle of active) {
        if (!particle.supported) continue
        particle.vx *= Math.pow(0.78, dt)
        particle.angularVelocity *= Math.pow(0.72, dt)
        if (Math.abs(particle.vx) < 0.12) particle.vx = 0
        if (Math.abs(particle.vy) < 0.9) particle.vy = 0
        if (Math.abs(particle.angularVelocity) < 0.08) particle.angularVelocity = 0
      }

      particles.forEach((particle, index) => {
        const node = nodesRef.current[index]
        if (!node || !particle.active) return
        node.style.opacity = '1'
        node.style.transform = `translate3d(${particle.x - radius}px, ${particle.y - radius}px, 0) rotate(${particle.angle}deg)`
      })
      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    let previousScrollY = window.scrollY
    let previousTime = performance.now()

    const reactToScroll = () => {
      const now = performance.now()
      const delta = window.scrollY - previousScrollY
      const elapsed = Math.max(now - previousTime, 8)
      previousScrollY = window.scrollY
      previousTime = now
      if (!delta || dragRef.current?.dragging || !boxRef.current) return

      const rect = boxRef.current.getBoundingClientRect()
      if (rect.bottom < -80 || rect.top > window.innerHeight + 80) return
      const impulse = Math.max(-2.4, Math.min(2.4, (delta / elapsed) * 3.2))
      for (const particle of particlesRef.current) {
        if (!particle.active) continue
        particle.vy -= impulse
        particle.vx += (Math.random() - 0.5) * Math.abs(impulse) * 0.12
        particle.angularVelocity += (Math.random() - 0.5) * Math.abs(impulse) * 0.1
      }
    }

    window.addEventListener('scroll', reactToScroll, { passive: true })
    return () => window.removeEventListener('scroll', reactToScroll)
  }, [])

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault()
    const box = boxRef.current
    if (!box) return
    const rect = box.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const particles = particlesRef.current
    let grabbedIndex = -1
    let closestDistance = 26
    particles.forEach((particle, index) => {
      if (!particle.active) return
      const distance = Math.hypot(particle.x - x, particle.y - y)
      if (distance >= closestDistance) return
      closestDistance = distance
      grabbedIndex = index
    })

    if (grabbedIndex >= 0) {
      dragRef.current = {
        index: grabbedIndex, pointerId: event.pointerId, startX: x, startY: y,
        lastX: x, lastY: y, lastTime: performance.now(), dragging: false,
      }
      box.setPointerCapture(event.pointerId)
      return
    }

    spawnAt(x, y)
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    const box = boxRef.current
    if (!drag || !box || drag.pointerId !== event.pointerId) return
    event.preventDefault()
    const rect = box.getBoundingClientRect()
    let x = Math.max(20, Math.min(rect.width - 20, event.clientX - rect.left))
    let y = Math.max(20, Math.min(rect.height - 20, event.clientY - rect.top))
    const cornerRadius = parseFloat(getComputedStyle(box).borderTopLeftRadius) || 0
    const innerCornerRadius = Math.max(0, cornerRadius - 20)
    const cornerX = x < cornerRadius ? cornerRadius : x > rect.width - cornerRadius ? rect.width - cornerRadius : null
    const cornerY = y < cornerRadius ? cornerRadius : y > rect.height - cornerRadius ? rect.height - cornerRadius : null
    if (innerCornerRadius > 0 && cornerX !== null && cornerY !== null) {
      const dx = x - cornerX
      const dy = y - cornerY
      const distance = Math.hypot(dx, dy) || 0.01
      if (distance > innerCornerRadius) {
        x = cornerX + (dx / distance) * innerCornerRadius
        y = cornerY + (dy / distance) * innerCornerRadius
      }
    }
    if (!drag.dragging) {
      if (Math.hypot(x - drag.startX, y - drag.startY) < 7) return
      drag.dragging = true
      box.classList.add('is-dragging')
      const grabbed = particlesRef.current[drag.index]
      grabbed.supported = false
      grabbed.vx = 0
      grabbed.vy = 0
    }
    const particle = particlesRef.current[drag.index]
    const now = performance.now()
    const frameScale = 16.667 / Math.max(now - drag.lastTime, 8)
    particle.x = x
    particle.y = y
    particle.vx = (x - drag.lastX) * frameScale
    particle.vy = (y - drag.lastY) * frameScale
    particle.angularVelocity = Math.max(-5, Math.min(5, particle.vx * 0.16))
    drag.lastX = x
    drag.lastY = y
    drag.lastTime = now
  }

  const releaseDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    const box = boxRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    if (!drag.dragging) spawnAt(drag.startX, drag.startY)
    dragRef.current = null
    box?.classList.remove('is-dragging')
    if (box?.hasPointerCapture(event.pointerId)) box.releasePointerCapture(event.pointerId)
  }

  const spawnAt = (x: number, y: number) => {
    const queue = queueRef.current
    const particles = particlesRef.current
    const nextIndex = particles.findIndex((particle, index) => !particle.active && !particle.retiring && !queue.includes(index))
    if (nextIndex < 0) return

    const particle = particles[nextIndex]
    particle.active = true
    particle.retiring = false
    particle.supported = false
    particle.x = x
    particle.y = y
    particle.vx = (Math.random() - 0.5) * 3.5
    particle.vy = -2.5 - Math.random() * 2
    particle.angle = Math.random() * 30 - 15
    particle.angularVelocity = (Math.random() - 0.5) * 4
    const nextNode = nodesRef.current[nextIndex]
    const nextSvg = nextNode?.querySelector('svg')
    if (nextNode) {
      nextNode.style.transform = `translate3d(${x - 20}px, ${y - 20}px, 0) rotate(${particle.angle}deg)`
      nextNode.style.opacity = '1'
    }
    if (nextSvg) {
      nextSvg.getAnimations().forEach((animation) => animation.cancel())
      nextSvg.style.opacity = '1'
      nextSvg.style.transform = 'scale(1)'
      nextSvg.style.transformOrigin = '50% 50%'
    }
    queue.push(nextIndex)

    if (queue.length > 36) retireOldest()
  }

  const retireOldest = () => {
    const oldestIndex = queueRef.current.shift()!
    const oldest = particlesRef.current[oldestIndex]
    const oldestNode = nodesRef.current[oldestIndex]
    const oldestSvg = oldestNode?.querySelector('svg')
    oldest.active = false
    oldest.retiring = true
    if (!oldestSvg) { oldest.retiring = false; return }
    const animation = oldestSvg.animate([
      { opacity: 1, transform: 'scale(1)' },
      { opacity: 0, transform: 'scale(0)' },
    ], {
      duration: 550,
      easing: 'cubic-bezier(.65, 0, .35, 1)',
      fill: 'forwards',
    })
    animation.onfinish = () => {
      if (oldestNode) { oldestNode.style.opacity = '0'; oldestNode.style.transform = '' }
      oldestSvg.style.removeProperty('opacity')
      oldestSvg.style.removeProperty('transform')
      oldest.retiring = false
    }
  }

  return (
    <div
      className="icon-showcase physics-showcase"
      ref={boxRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={releaseDrag}
      onPointerCancel={releaseDrag}
    >
      {particleIcons.map((name, index) => (
        <span className="physics-icon" key={name} ref={(node) => { nodesRef.current[index] = node }}>
          <Icon name={name} size={32} />
        </span>
      ))}
    </div>
  )
}
