import { useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { Icon, type IconName } from 'uplus-icon/dynamic'
import { iconMeta } from 'uplus-icon/metadata'
import { useI18n } from '../i18n'

export function IconsPage({ navigate }: { navigate: (path: string) => void }) {
  const { t } = useI18n()
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase()
    if (!value) return iconMeta
    return iconMeta.filter(({ name, title, titleZh, tags, aliases, categories }) =>
      [name, title, titleZh, ...tags, ...aliases, ...categories].some((term) => term.toLowerCase().includes(value)))
  }, [query])

  return <section className="library-page">
    <div className="library-head">
      <div><p className="eyebrow" data-reveal>{t('library')} / {iconMeta.length}</p><h1 data-reveal>{t('findShape')}</h1></div>
      <label className="search" data-reveal><Icon name="search" size={19} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('search')} autoFocus /><kbd>⌘ K</kbd></label>
    </div>
    <div className="result-bar" data-reveal><span>{filtered.length} icons</span><span>24 × 24</span></div>
    {filtered.length ? <div className="icon-grid">{filtered.map(({ name }) => <IconCard key={name} name={name as IconName} navigate={navigate} />)}</div>
      : <div className="empty"><Icon name="search" size={32} /><h2>{t('noIcon')}</h2><p>{t('noIconText')}</p></div>}
  </section>
}

function IconCard({ name, navigate }: { name: IconName; navigate: (path: string) => void }) {
  const cardRef = useRef<HTMLButtonElement>(null)
  const onEnter = () => gsap.to(cardRef.current?.querySelector('svg') ?? null, { scale: 1.18, rotate: -5, duration: 0.35, ease: 'back.out(2)' })
  const onLeave = () => gsap.to(cardRef.current?.querySelector('svg') ?? null, { scale: 1, rotate: 0, duration: 0.3, ease: 'power2.out' })
  return <button ref={cardRef} className="icon-card" data-reveal onMouseEnter={onEnter} onMouseLeave={onLeave} onClick={() => navigate(`/icons/${name}`)}>
    <span className="icon-stage"><Icon name={name} size={32} /></span><span className="icon-name">{name}</span><Icon name="arrow-right" size={15} className="card-arrow" />
  </button>
}

export function IconDetailPage({ name, navigate }: { name: IconName; navigate: (path: string) => void }) {
  const { t } = useI18n()
  const [size, setSize] = useState(96)
  const [copied, setCopied] = useState(false)
  const component = `${name.split('-').map((part) => part[0].toUpperCase() + part.slice(1)).join('')}Icon`
  const snippet = `import { ${component} } from 'uplus-icon'`
  const copy = async () => {
    await navigator.clipboard.writeText(snippet)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }
  return <section className="detail-page">
    <button className="back" onClick={() => navigate('/icons')} data-reveal><Icon name="arrow-left" size={17} /> {t('allIcons')}</button>
    <div className="detail-title" data-reveal><div><p className="eyebrow">Icon / 24px</p><h1>{name}</h1></div><span className="status">{t('ready')}</span></div>
    <div className="detail-layout">
      <div className="preview-panel" data-reveal><div className="preview-grid"><Icon name={name} size={size} /></div><div className="size-control"><span>{t('size')}</span><input type="range" min="24" max="160" value={size} onChange={(event) => setSize(Number(event.target.value))} /><output>{size}px</output></div></div>
      <aside className="usage-panel" data-reveal><p className="eyebrow">React</p><h2>{t('useIcon')}</h2><p>{t('useText')}</p><button className="code-block" onClick={copy}><code>{snippet}</code><span>{copied ? t('copied') : <Icon name="copy" size={17} />}</span></button><div className="api-list"><div><span>size</span><code>number | string</code></div><div><span>color</span><code>SVG source</code></div><div><span>title</span><code>string</code></div></div></aside>
    </div>
  </section>
}
