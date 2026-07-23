import { getDocGroupLabels, getDocPath, type DocDocument, type DocGroup, type DocSlug } from '../content/docs'

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
        <button
          className={`docs-index-featured${active === 'guide' ? ' active' : ''}`}
          type="button"
          onClick={() => navigate('/guide')}
          aria-current={active === 'guide' ? 'page' : undefined}
        >
          <strong>{language === 'zh' ? '使用指南' : 'Get started'}</strong>
          <span className="docs-index-featured-badge" aria-hidden="true">START</span>
        </button>
      </div>
      <div className="docs-index-scroll">
        {documentGroups.map(({ group, documents: groupDocuments }, groupIndex) => (
          <div className="docs-index-group" key={`${group}-${groupIndex}`}>
            <h2>{labels[group]}</h2>
            {groupDocuments.map((item) => (
              <button
                className={active === item.slug ? 'active' : ''}
                type="button"
                onClick={() => navigate(mobileIndex ? `/docs/${item.slug}` : getDocPath(item.slug))}
                aria-current={active === item.slug ? 'page' : undefined}
                key={item.slug}
              >
                <b>{String(item.order).padStart(2, '0')}</b>
                <span><strong>{item.title}</strong></span>
              </button>
            ))}
          </div>
        ))}
      </div>
      <div className="docs-index-fixed docs-index-fixed-bottom">
        <button
          className={`docs-index-featured${active === 'changelog' ? ' active' : ''}`}
          type="button"
          onClick={() => navigate('/changelog')}
          aria-current={active === 'changelog' ? 'page' : undefined}
        >
          <strong>{language === 'zh' ? '更新日志' : 'Changelog'}</strong>
          <span className="docs-index-featured-badge" aria-hidden="true">DEV</span>
        </button>
      </div>
    </nav>
  )
}
