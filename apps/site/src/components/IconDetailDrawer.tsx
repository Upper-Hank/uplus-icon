import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { Icon, type IconName } from '@uplus-icon/react/dynamic'
import { iconDefinitions } from '@uplus-icon/core/dynamic'
import { iconCategories, iconMeta } from '@uplus-icon/core/metadata'
import { useI18n } from '../i18n'
import { IconDetailPreview, type IconPreviewMode } from './IconDetailPreview'
import { SegmentedControl } from './LibraryControls'

interface IconDetailDrawerProps {
  name: IconName
  onClose: () => void
}

type CopyTarget = 'name' | 'usage'
type UsageFormat = 'react' | 'svg' | 'web'

export function IconDetailDrawer({ name, onClose }: IconDetailDrawerProps) {
  const { language } = useI18n()
  const [previewMode, setPreviewMode] = useState<IconPreviewMode>('master')
  const [size, setSize] = useState(24)
  const [strokeWidth, setStrokeWidth] = useState(2)
  const [absoluteStrokeWidth, setAbsoluteStrokeWidth] = useState(false)
  const [usageFormat, setUsageFormat] = useState<UsageFormat>('react')
  const [moreOpen, setMoreOpen] = useState(false)
  const [copied, setCopied] = useState<CopyTarget | null>(null)
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
  const effectiveSize = previewMode === 'master' ? 24 : size
  const effectiveAbsoluteStrokeWidth = previewMode === 'actual' && absoluteStrokeWidth
  const sizeProp = effectiveSize === 24 ? '' : ` size={${effectiveSize}}`
  const strokeProp = strokeWidth === 2 ? '' : ` strokeWidth={${strokeWidth}}`
  const absoluteStrokeProp = effectiveAbsoluteStrokeWidth ? ' absoluteStrokeWidth' : ''
  const reactSnippet = `import { ${component} } from '@uplus-icon/react'\n\n<${component}${sizeProp}${strokeProp}${absoluteStrokeProp} />`
  const svgSource = definition
    ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${definition.viewBox}" width="${effectiveSize}" height="${effectiveSize}" fill="none">\n${definition.body.trim()
      .split('var(--uplus-icon-stroke-width, 2)').join(String(strokeWidth))
      .split('var(--uplus-icon-vector-effect, none)').join(effectiveAbsoluteStrokeWidth ? 'non-scaling-stroke' : 'none')}\n</svg>`
    : ''
  const webSizeAttribute = effectiveSize === 24 ? '' : ` size="${effectiveSize}"`
  const webStrokeAttribute = strokeWidth === 2 ? '' : ` stroke-width="${strokeWidth}"`
  const webAbsoluteStrokeAttribute = effectiveAbsoluteStrokeWidth ? ' absolute-stroke-width' : ''
  const webSnippet = `import '@uplus-icon/web/element'\n\n<uplus-icon name="${name}"${webSizeAttribute}${webStrokeAttribute}${webAbsoluteStrokeAttribute}></uplus-icon>`
  const usage = usageFormat === 'react' ? reactSnippet : usageFormat === 'svg' ? svgSource : webSnippet
  const usageLabel = usageFormat === 'react' ? 'React' : usageFormat === 'svg' ? 'SVG' : 'Web'
  const usageOptions = [
    { value: 'react', label: 'React', content: 'React' },
    { value: 'svg', label: 'SVG', content: 'SVG' },
    { value: 'web', label: 'Web Component', content: 'Web' },
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
      const remaining = Math.max(0, maxScroll - content.scrollTop)
      const progress = maxScroll === 0 || revealDistance === 0
        ? 0
        : prefersReducedMotion
          ? Number(remaining <= 1)
          : Math.max(0, Math.min(1, 1 - remaining / revealDistance))

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
    const previousOverflow = document.body.style.overflow
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') requestClose()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', closeOnEscape)
    drawerRef.current?.focus()
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
      window.clearTimeout(copyTimerRef.current)
      previousFocus?.focus()
    }
  }, [requestClose])

  const copy = async (target: CopyTarget, value: string) => {
    await navigator.clipboard.writeText(value)
    setCopied(target)
    window.clearTimeout(copyTimerRef.current)
    copyTimerRef.current = window.setTimeout(() => setCopied(null), 1600)
  }

  const copyLabel = (target: CopyTarget, fallback: string) => copied === target
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
                <Icon name={copied === 'name' ? 'check' : 'copy'} size={15} />
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
            strokeWidth={strokeWidth}
            absoluteStrokeWidth={absoluteStrokeWidth}
            onModeChange={setPreviewMode}
            onSizeChange={setSize}
            onStrokeWidthChange={setStrokeWidth}
            onAbsoluteStrokeWidthChange={setAbsoluteStrokeWidth}
          />

          {metadata && <section className="drawer-reference" aria-label={language === 'zh' ? '图标规格' : 'Icon specification'}>
            {metadata.description && <p className="drawer-description">{language === 'zh' ? metadata.description.zh : metadata.description.en}</p>}
            <dl className="drawer-specs">
              <div><dt>{language === 'zh' ? '画布' : 'Canvas'}</dt><dd>24 × 24</dd></div>
              <div><dt>{language === 'zh' ? '渲染' : 'Rendering'}</dt><dd>{renderingType}</dd></div>
              <div><dt>{language === 'zh' ? '分类' : 'Category'}</dt><dd>{(() => {
                const category = iconCategories.find((item) => item.id === metadata.categories[0])
                return language === 'zh' ? category?.titleZh : category?.title
              })() ?? '—'}</dd></div>
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
            <div className="drawer-more-content" id={`${titleId}-more`} ref={moreContentRef}>
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
              <span>{language === 'zh' ? '当前配置' : 'Current configuration'}</span>
            </div>
            <pre><code>{usage}</code></pre>
          </div>
        </footer>
      </aside>
    </div>
  )
}
