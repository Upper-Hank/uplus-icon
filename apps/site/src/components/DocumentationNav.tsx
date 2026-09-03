import { getDocGroupLabels, getDocPath, type DocDocument, type DocGroup, type DocSlug } from '../content/docs'
import { currentVersionLabel } from '../app/releaseInfo'
import { AppLink } from './AppLink'

interface DocumentationNavProps {
  active?: DocSlug | 'guide' | 'changelog'
  documents: DocDocument[]
  language: 'en' | 'zh'
  mobileIndex?: boolean
  navigate: (path: string) => void
}

export function DocumentationNav({ active, documents, language, mobileIndex = false, navigate }: DocumentationNavProps) {
  const labels = getDocGroupLabels(language)
  const orderedDocuments = [...documents].sort((a, b) => a.order - b.order)
  const documentGroups: Array<{ group: DocGroup; documents: DocDocument[] }> = []

  for (const document of orderedDocuments) {
    const currentGroup = documentGroups[documentGroups.length - 1]
    if (currentGroup?.group === document.group) {
      currentGroup.documents.push(document)
    } else {
      documentGroups.push({ group: document.group, documents: [document] })
    }
  }

  return (
    <nav aria-label={language === 'zh' ? '文档目录' : 'Documentation'}>
      <div className="docs-index-fixed docs-index-fixed-top">
        <AppLink
          className={`docs-index-featured${active === 'guide' ? ' active' : ''}`}
          to="/guide"
          navigate={navigate}
          aria-current={active === 'guide' ? 'page' : undefined}
        >
          <strong>{language === 'zh' ? '使用指南' : 'Get started'}</strong>
          <span className="docs-index-featured-badge" aria-hidden="true">START</span>
        </AppLink>
      </div>
      <div className="docs-index-scroll">
        {documentGroups.map(({ group, documents: groupDocuments }, groupIndex) => (
          <div className="docs-index-group" key={`${group}-${groupIndex}`}>
            <h2>{labels[group]}</h2>
            {groupDocuments.map((item) => (
              <AppLink
                className={active === item.slug ? 'active' : ''}
                to={mobileIndex ? `/docs/${item.slug}` : getDocPath(item.slug)}
                navigate={navigate}
                aria-current={active === item.slug ? 'page' : undefined}
                key={item.slug}
              >
                <b>{String(item.order).padStart(2, '0')}</b>
                <span><strong>{item.title}</strong></span>
              </AppLink>
            ))}
          </div>
        ))}
      </div>
      <div className="docs-index-fixed docs-index-fixed-bottom">
        <AppLink
          className={`docs-index-featured${active === 'changelog' ? ' active' : ''}`}
          to="/changelog"
          navigate={navigate}
          aria-current={active === 'changelog' ? 'page' : undefined}
        >
          <strong>{language === 'zh' ? '更新日志' : 'Changelog'}</strong>
          <span className="docs-index-featured-badge">{currentVersionLabel}</span>
        </AppLink>
      </div>
    </nav>
  )
}
