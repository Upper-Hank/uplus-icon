import { Icon } from 'uplus-icon/dynamic'
import { useI18n } from '../i18n'

export function DocsPage() {
  const { t } = useI18n()
  const sections = [
    { id: 'principles', label: t('principles') }, { id: 'drawing', label: t('drawing') },
    { id: 'usage', label: t('using') }, { id: 'workflow', label: t('workflow') },
  ]
  const scrollToSection = (id: string) => {
    const section = document.getElementById(id)
    if (!section) return
    window.scrollTo({ top: section.getBoundingClientRect().top + window.scrollY - 96, behavior: 'smooth' })
    window.history.replaceState({}, '', `/docs#${id}`)
  }

  return <section className="docs-page">
    <div className="docs-hero"><p className="eyebrow" data-reveal>{t('docLabel')}</p><h1 data-reveal>{t('docTitle').split('\n').map((line, index) => <span key={line}>{index > 0 && <br />}{line}</span>)}</h1><p data-reveal>{t('docIntro')}</p></div>
    <div className="docs-layout">
      <aside className="docs-nav" data-reveal><span>{t('onPage')}</span>{sections.map((section, index) => <button type="button" onClick={() => scrollToSection(section.id)} key={section.id}><b>0{index + 1}</b>{section.label}</button>)}</aside>
      <div className="docs-content">
        <article id="principles" data-reveal><p className="doc-number">01 / {t('principles')}</p><h2>{t('quiet')}</h2><p>{t('quietText')}</p><div className="doc-cards"><div><Icon name="grid" size={28} /><h3>{t('gridFirst')}</h3><p>{t('gridFirstText')}</p></div><div><Icon name="eye" size={28} /><h3>{t('optical')}</h3><p>{t('opticalText')}</p></div><div><Icon name="minus" size={28} /><h3>{t('reduce')}</h3><p>{t('reduceText')}</p></div></div></article>
        <article id="drawing" data-reveal><p className="doc-number">02 / {t('drawing')}</p><h2>{t('built24')}</h2><p>{t('built24Text')}</p><div className="spec-row"><span>{t('canvas')}</span><strong>24 × 24 px</strong></div><div className="spec-row"><span>{t('color')}</span><strong>SVG source</strong></div><div className="spec-row"><span>{t('format')}</span><strong>{t('optimized')}</strong></div></article>
        <article id="usage" data-reveal><p className="doc-number">03 / {t('using')}</p><h2>{t('familiar')}</h2><p>{t('familiarText')}</p><div className="docs-code"><span>React</span><pre><code>{`import { SearchIcon } from 'uplus-icon'\n\n<SearchIcon size={24} />\n<SearchIcon size={20} />\n<SearchIcon title="Search" aria-label="Search" />`}</code></pre></div><p>{t('dynamicText')}</p><div className="docs-code"><span>Dynamic</span><pre><code>{`import { Icon } from 'uplus-icon/dynamic'\n\n<Icon name="search" size={24} />`}</code></pre></div></article>
        <article id="workflow" data-reveal><p className="doc-number">04 / {t('workflow')}</p><h2>{t('oneSource')}</h2><p>{t('oneSourceText')}</p><ol className="workflow-list"><li><span>01</span><div><h3>{t('addSvg')}</h3><p>{t('addSvgText')}</p></div></li><li><span>02</span><div><h3>{t('generate')}</h3><p>{t('generateText')}</p></div></li><li><span>03</span><div><h3>{t('release')}</h3><p>{t('releaseText')}</p></div></li></ol></article>
      </div>
    </div>
  </section>
}
