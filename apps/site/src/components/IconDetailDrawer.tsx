import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { Icon, type IconName } from '@uplus-icon/react/dynamic'
import { iconDefinitions } from '@uplus-icon/core/dynamic'
import { iconCategories, iconMeta, iconSubgroups } from '@uplus-icon/core/metadata'
import { useI18n } from '../i18n'
import { copyText } from '../app/copyText'
import { createPreviewSvg, resolveStaticPreviewSettings } from '../app/previewSvg'
import { IconDetailPreview, type IconPreviewMode } from './IconDetailPreview'
import { SegmentedControl } from './LibraryControls'

interface IconDetailDrawerProps {
  name: IconName
  onClose: () => void
}

type CopyTarget = 'name' | 'usage'
type UsageFormat = 'core' | 'react' | 'svg'

export function IconDetailDrawer({ name, onClose }: IconDetailDrawerProps) {
  const { language } = useI18n()
  const [previewMode, setPreviewMode] = useState<IconPreviewMode>('master')
  const [size, setSize] = useState(24)
  const [weight, setWeight] = useState(2)
  const [absoluteWeight, setAbsoluteWeight] = useState(false)
  const [previewColor, setPreviewColor] = useState<string | null>(null)
  const [usageFormat, setUsageFormat] = useState<UsageFormat>('svg')
  const [moreOpen, setMoreOpen] = useState(false)
  const [copied, setCopied] = useState<CopyTarget | null>(null)
  const [copyFailed, setCopyFailed] = useState<CopyTarget | null>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const drawerRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const moreContentRef = useRef<HTMLDivElement>(null)
  const codeDockRef = useRef<HTMLElement>(null)
  const codePanelRef = useRef<HTMLDivElement>(null)
  const copyTimerRef = useRef<number | undefined>(undefined)
  const closingRef = useRef(false)
  const metadata = iconMeta.find((icon) => icon.name === name)
  const definition = iconDefinitions.find((icon) => icon.name === name)
  const component = `${name.split('-').map((part) => part[0].toUpperCase() + part.slice(1)).join('')}Icon`
  const titleId = `icon-drawer-title-${name}`
  const staticPreview = resolveStaticPreviewSettings(previewMode, size, weight, absoluteWeight)
  const effectiveSize = staticPreview.size
  const effectiveAbsoluteWeight = staticPreview.absoluteWeight
  const sizeProp = effectiveSize === 24 ? '' : ` size={${effectiveSize}}`
  const weightProp = weight === 2 ? '' : ` weight={${weight}}`
  const absoluteWeightProp = effectiveAbsoluteWeight ? ' absoluteWeight' : ''
  const colorProp = previewColor ? ` color="${previewColor}"` : ''
  const reactSnippet = `import { ${component} } from '@uplus-icon/react'\n\n<${component}${sizeProp}${weightProp}${absoluteWeightProp}${colorProp} />`
  const coreSnippet = `import icon from '@uplus-icon/core/icons/${name}'\n\nicon`
  const svgSource = definition ? createPreviewSvg({ definition, ...staticPreview, color: previewColor ?? undefined }) : ''
  const usage = { core: coreSnippet, react: reactSnippet, svg: svgSource }[usageFormat]
  const usageLabel = { core: 'Core', react: 'React', svg: 'SVG' }[usageFormat]
  const usageOptions = [
    { value: 'svg', label: 'SVG', content: 'SVG' },
    { value: 'core', label: 'Core', content: 'Core' },
    { value: 'react', label: 'React', content: 'React' },
  ] as const
  const renderingType = definition
    ? definition.body.includes('stroke=') && definition.body.includes('fill="currentColor"') ? 'Mixed'
      : definition.body.includes('stroke=') ? 'Stroke' : 'Fill'
    : '—'

  const requestClose = useCallback(() => {
    if (closingRef.current) return
    const overlay = overlayRef.current
    const drawer = drawerRef.current
    if (!overlay || !drawer || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onClose()
      return
    }
    closingRef.current = true
    gsap.timeline({ onComplete: onClose })
      .to(drawer, { y: 32, opacity: 0, duration: 0.22, ease: 'power2.in' }, 0)
      .to(overlay, { opacity: 0, duration: 0.18, ease: 'power1.out' }, 0.04)
  }, [onClose])

  useLayoutEffect(() => {
    const overlay = overlayRef.current
    const drawer = drawerRef.current
    if (!overlay || !drawer) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set([overlay, drawer], { clearProps: 'opacity,transform' })
      return
    }
    const context = gsap.context(() => {
      gsap.set(overlay, { opacity: 0 })
      gsap.set(drawer, { y: 36, opacity: 0 })
      gsap.timeline()
        .to(overlay, { opacity: 1, duration: 0.18, ease: 'power1.out' }, 0)
        .to(drawer, { y: 0, opacity: 1, duration: 0.34, ease: 'power3.out' }, 0)
        .set([overlay, drawer], { clearProps: 'opacity,transform' })
    }, overlay)
    return () => context.revert()
  }, [])

  useLayoutEffect(() => {
    const content = contentRef.current
    const codeDock = codeDockRef.current
    const codePanel = codePanelRef.current
    if (!content || !codeDock || !codePanel) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const updateCodeReveal = () => {
      const panelBottomInset = 12
      const revealDistance = codePanel.offsetTop + codePanel.offsetHeight - codeDock.offsetHeight + panelBottomInset
      const maxScroll = Math.max(0, content.scrollHeight - content.clientHeight)
      const scrollTop = Math.max(0, Math.min(content.scrollTop, maxScroll))
      const revealStart = Math.max(0, maxScroll - revealDistance)
      const revealRange = maxScroll - revealStart
      const progress = maxScroll === 0 || revealRange === 0
        ? 0
        : prefersReducedMotion
          ? Number(maxScroll - scrollTop <= 1)
          : Math.max(0, Math.min(1, (scrollTop - revealStart) / revealRange))

      gsap.set(codeDock, { y: -progress * revealDistance })
    }

    const resizeObserver = new ResizeObserver(updateCodeReveal)
    content.addEventListener('scroll', updateCodeReveal, { passive: true })
    resizeObserver.observe(content)
    resizeObserver.observe(codePanel)
    if (moreContentRef.current) resizeObserver.observe(moreContentRef.current)
    updateCodeReveal()

    return () => {
      content.removeEventListener('scroll', updateCodeReveal)
      resizeObserver.disconnect()
      gsap.killTweensOf(codeDock)
    }
  }, [])

  useEffect(() => {
    const scrollY = window.scrollY
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const { overflow, position, top, width } = document.body.style
    const handleDialogKeys = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        requestClose()
        return
      }
      if (event.key !== 'Tab') return
      const drawer = drawerRef.current
      if (!drawer) return
      const focusable = [...drawer.querySelectorAll<HTMLElement>(
        'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
      )].filter((element) => !element.hidden && !element.closest('[inert]'))
      if (!focusable.length) {
        event.preventDefault()
        drawer.focus()
        return
      }
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && (document.activeElement === first || !drawer.contains(document.activeElement))) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'
    window.addEventListener('keydown', handleDialogKeys)
    drawerRef.current?.focus()

    return () => {
      document.body.style.overflow = overflow
      document.body.style.position = position
      document.body.style.top = top
      document.body.style.width = width
      window.scrollTo(0, scrollY)
      window.removeEventListener('keydown', handleDialogKeys)
      window.clearTimeout(copyTimerRef.current)
      previousFocus?.focus({ preventScroll: true })
    }
  }, [requestClose])

  const copy = async (target: CopyTarget, value: string) => {
    const success = await copyText(value)
    setCopied(success ? target : null)
    setCopyFailed(success ? null : target)
    window.clearTimeout(copyTimerRef.current)
    copyTimerRef.current = window.setTimeout(() => {
      setCopied(null)
      setCopyFailed(null)
    }, 1600)
  }

  const copyLabel = (target: CopyTarget, fallback: string) => copyFailed === target
    ? (language === 'zh' ? '复制失败' : 'Copy failed')
    : copied === target
      ? (language === 'zh' ? '已复制' : 'Copied')
      : fallback

  return (
    <div className="icon-detail-overlay" ref={overlayRef} role="presentation" onPointerDown={(event) => {
      if (event.target === event.currentTarget) requestClose()
    }}>
      <aside className="icon-detail-drawer" ref={drawerRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <header className="drawer-topbar">
          <div className={`drawer-title${language === 'en' ? ' is-single-line' : ''}`}>
            <div className="drawer-title-line">
              <h1 id={titleId}>{name}</h1>
              <button className="drawer-name-copy" type="button" onClick={() => copy('name', name)} aria-label={copyLabel('name', language === 'zh' ? '复制图标名称' : 'Copy icon name')}>
                <Icon name={copied === 'name' ? 'save' : 'copy'} size={15} />
              </button>
            </div>
            {metadata && language === 'zh' && <p>{metadata.titleZh}</p>}
          </div>
          <button type="button" onClick={requestClose} aria-label={language === 'zh' ? '关闭图标详情' : 'Close icon detail'}>
            <Icon name="close" size={18} />
          </button>
        </header>

        <div className="drawer-content" ref={contentRef}>
          <IconDetailPreview
            name={name}
            definition={definition}
            mode={previewMode}
            size={size}
            weight={weight}
            absoluteWeight={absoluteWeight}
            color={previewColor}
            onModeChange={setPreviewMode}
            onSizeChange={setSize}
            onWeightChange={setWeight}
            onAbsoluteWeightChange={setAbsoluteWeight}
            onColorChange={setPreviewColor}
          />

          {metadata && <section className="drawer-reference" aria-label={language === 'zh' ? '图标规格' : 'Icon specification'}>
            {metadata.description && <p className="drawer-description">{language === 'zh' ? metadata.description.zh : metadata.description.en}</p>}
            <dl className="drawer-specs">
              <div><dt>{language === 'zh' ? '画布' : 'Canvas'}</dt><dd>24 × 24</dd></div>
              <div><dt>{language === 'zh' ? '渲染' : 'Rendering'}</dt><dd>{renderingType}</dd></div>
              <div><dt>{language === 'zh' ? '分类' : 'Category'}</dt><dd>{(() => {
                const category = iconCategories.find((item) => item.id === metadata.categories[0])
                const subgroup = iconSubgroups.find((item) => item.categoryId === metadata.categories[0] && item.id === metadata.subgroup)
                const categoryLabel = language === 'zh' ? category?.titleZh : category?.title
                const subgroupLabel = language === 'zh' ? subgroup?.titleZh : subgroup?.title
                if (!categoryLabel) return '—'
                return subgroupLabel ? `${categoryLabel} · ${subgroupLabel}` : categoryLabel
              })()}</dd></div>
              <div><dt>{language === 'zh' ? '版本' : 'Version'}</dt><dd>{metadata.publishedIn ?? '—'}</dd></div>
            </dl>
          </section>}

          {metadata && <section className={`drawer-more${moreOpen ? ' is-open' : ''}`}>
            <button
              className="drawer-more-toggle"
              type="button"
              aria-expanded={moreOpen}
              aria-controls={`${titleId}-more`}
              onClick={() => setMoreOpen((open) => !open)}
            >{language === 'zh' ? '更多信息' : 'More information'}</button>
            <div className="drawer-more-content" id={`${titleId}-more`} ref={moreContentRef} aria-hidden={!moreOpen} inert={!moreOpen}>
              <div className="drawer-more-content-inner">
                <div className="drawer-metadata">
                  <div><span>{language === 'zh' ? '标签' : 'Tags'}</span><p>{metadata.tags.join(' · ')}</p></div>
                  <div><span>{language === 'zh' ? '别名' : 'Aliases'}</span><p>{metadata.aliases.join(' · ') || '—'}</p></div>
                  <div><span>{language === 'zh' ? '全部分类' : 'All categories'}</span><p>{metadata.categories.map((id) => {
                    const category = iconCategories.find((item) => item.id === id)
                    return language === 'zh' ? category?.titleZh : category?.title
                  }).filter(Boolean).join(' · ')}</p></div>
                </div>
              </div>
            </div>
          </section>}
        </div>

        <footer className="drawer-code-dock" ref={codeDockRef}>
          <div className="drawer-copybar">
            <SegmentedControl ariaLabel={language === 'zh' ? '使用格式' : 'Usage format'} className="drawer-format-control" options={usageOptions} value={usageFormat} onChange={setUsageFormat} />
            <button className="drawer-copy-primary" type="button" onClick={() => copy('usage', usage)} disabled={!usage}>{copyLabel('usage', language === 'zh' ? `复制 ${usageLabel}` : `Copy ${usageLabel}`)}</button>
          </div>
          <div className="drawer-code-panel" ref={codePanelRef}>
            <div className="drawer-code-heading">
              <span>{usageLabel}</span>
              <span>{usageFormat === 'svg'
                ? (language === 'zh' ? '已应用当前静态预览参数' : 'Current static preview applied')
                : usageFormat === 'core'
                  ? (language === 'zh' ? '原始图标定义' : 'Original icon definition')
                  : (language === 'zh' ? '当前配置' : 'Current configuration')}</span>
            </div>
            <pre><code>{usage}</code></pre>
          </div>
        </footer>
      </aside>
    </div>
  )
}
