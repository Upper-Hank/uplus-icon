import type { PropsWithChildren } from 'react'
import { Icon } from '@uplus-icon/react/dynamic'
import { getDocuments, type DocSlug } from '../content/docs'
import { useI18n } from '../i18n'
import { DocumentationNav } from './DocumentationNav'

interface DocumentationShellProps extends PropsWithChildren {
  active: DocSlug | 'changelog'
  mobileIndex: boolean
  navigate: (path: string) => void
}

export function DocumentationShell({ active, children, mobileIndex, navigate }: DocumentationShellProps) {
  const { language } = useI18n()
  const documents = getDocuments(language)

  return (
    <section className={`docs-page${mobileIndex ? ' docs-page-mobile-index' : ' docs-page-mobile-article'}`}>
      <aside className="docs-index docs-index-desktop">
        <DocumentationNav active={active} documents={documents} language={language} navigate={navigate} />
      </aside>

      <div className="docs-mobile-index" data-reveal>
        <header className="docs-mobile-index-heading">
          <p>{language === 'zh' ? 'Uplus Icon 指南' : 'Uplus Icon guide'}</p>
          <h1>{language === 'zh' ? '文档' : 'Documentation'}</h1>
        </header>
        <div className="docs-index">
          <DocumentationNav documents={documents} language={language} mobileIndex navigate={navigate} />
        </div>
      </div>

      <button className="docs-mobile-back" type="button" onClick={() => navigate('/docs')}>
        <Icon name="chevron-left" size={16} />
        {language === 'zh' ? '全部文档' : 'All documentation'}
      </button>

      {children}
    </section>
  )
}
