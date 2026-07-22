import { useEffect, useState, type ComponentPropsWithoutRef, type MouseEvent } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getDocPath, getDocument, getDocuments, headingId, type DocDocument, type DocGroup, type DocSlug } from '../content/docs'
import { useI18n } from '../i18n'
import { PageHeading } from '../components/PageHeading'
import { UiIcon } from '../components/UiIcon'

interface DocsPageProps {
  doc: DocSlug
  navigate: (path: string) => void
}

const groupOrder: DocGroup[] = ['foundations', 'visual', 'motion', 'architecture', 'governance', 'usage']
const groupLabels = {
  en: { foundations: 'Foundations', visual: 'Visual rules', motion: 'Motion', architecture: 'Architecture', governance: 'Governance', usage: 'Usage' },
  zh: { foundations: '基础', visual: '视觉规则', motion: '动效', architecture: '架构', governance: '治理', usage: '使用' },
} satisfies Record<'en' | 'zh', Record<DocGroup, string>>

interface DocumentationNavProps {
  doc: DocSlug
  documents: DocDocument[]
  labels: Record<DocGroup, string>
  language: 'en' | 'zh'
  navigate: (path: string) => void
}

export function DocsPage({ doc, navigate }: DocsPageProps) {
  const { language } = useI18n()
  const documents = getDocuments(language)
  const document = getDocument(doc, language)
  const labels = groupLabels[language]

  return (
    <section className="docs-page">
      <aside className="docs-index docs-index-desktop">
        <DocumentationNav doc={doc} documents={documents} labels={labels} language={language} navigate={navigate} />
      </aside>

      <details className="docs-index docs-index-mobile" data-reveal>
        <summary>
          <strong>{document.title}</strong>
          <UiIcon className="docs-index-chevron docs-index-chevron-down" name="chevron-down" />
          <UiIcon className="docs-index-chevron docs-index-chevron-up" name="chevron-up" />
        </summary>
        <DocumentationNav doc={doc} documents={documents} labels={labels} language={language} navigate={navigate} />
      </details>

      <article className="docs-article" data-reveal>
        <PageHeading
          label={`${String(document.order).padStart(2, '0')} / ${labels[document.group]}`}
          title={document.title}
          description={document.description}
          meta={<><span>v0.1</span><span>{language === 'zh' ? '工作草案' : 'Working draft'}</span><span>Uplus Icon v1</span></>}
        />
        <details className="docs-toc-mobile">
          <summary>{language === 'zh' ? '本页目录' : 'On this page'}</summary>
          <TableOfContents document={document} />
        </details>
        <MarkdownArticle document={document} navigate={navigate} />
      </article>

      <aside className="docs-toc-desktop">
        <TableOfContents document={document} />
      </aside>
    </section>
  )
}

function DocumentationNav({ doc, documents, labels, language, navigate }: DocumentationNavProps) {
  return (
    <nav aria-label={language === 'zh' ? '文档目录' : 'Documentation'}>
      {groupOrder.map((group) => (
        <div className="docs-index-group" key={group}>
          <h2>{labels[group]}</h2>
          {documents.filter((item) => item.group === group).map((item) => (
            <button
              className={doc === item.slug ? 'active' : ''}
              type="button"
              onClick={() => navigate(getDocPath(item.slug))}
              aria-current={doc === item.slug ? 'page' : undefined}
              key={item.slug}
            >
              <b>{String(item.order).padStart(2, '0')}</b>
              <span><strong>{item.title}</strong></span>
            </button>
          ))}
        </div>
      ))}
    </nav>
  )
}

function TableOfContents({ document }: { document: DocDocument }) {
  const [activeId, setActiveId] = useState(document.headings[0]?.id)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const headerHeight = Number.parseFloat(getComputedStyle(window.document.documentElement).getPropertyValue('--header-height')) || 64
      const threshold = headerHeight + 32
      const headings = document.headings
        .map((heading) => window.document.getElementById(heading.id))
        .filter((heading): heading is HTMLElement => Boolean(heading))
      let current = headings[0]?.id
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top > threshold) break
        current = heading.id
      }
      setActiveId(current)
    }
    const requestUpdate = () => {
      if (frame) return
      frame = window.requestAnimationFrame(update)
    }

    requestUpdate()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
    }
  }, [document])

  return (
    <nav aria-label={document.locale === 'zh-CN' ? '本页目录' : 'On this page'}>
      {document.headings.map((heading) => (
        <a className={heading.depth === 3 ? 'depth-3' : undefined} href={`#${heading.id}`} aria-current={activeId === heading.id ? 'location' : undefined} key={heading.id}>
          {heading.label}
        </a>
      ))}
    </nav>
  )
}

function MarkdownArticle({ document, navigate }: { document: DocDocument; navigate: (path: string) => void }) {
  const onLink = (event: MouseEvent<HTMLAnchorElement>, href?: string) => {
    if (!href?.startsWith('/docs')) return
    event.preventDefault()
    navigate(href)
  }

  const heading = (Tag: 'h2' | 'h3') => function Heading({ children, ...props }: ComponentPropsWithoutRef<typeof Tag>) {
    const label = String(children)
    return <Tag id={headingId(label)} {...props}>{children}</Tag>
  }

  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: heading('h2'),
          h3: heading('h3'),
          a: ({ href, children, ...props }) => (
            <a href={href} onClick={(event) => onLink(event, href)} {...props}>{children}</a>
          ),
        }}
      >
        {document.body}
      </ReactMarkdown>
    </div>
  )
}
