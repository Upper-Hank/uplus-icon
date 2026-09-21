import { Children, isValidElement, useEffect, useState, type ComponentPropsWithoutRef, type MouseEvent, type ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getDocGroupLabels, getDocument, headingId, type DocDocument, type DocSlug } from '../content/docs'
import { useI18n } from '../i18n'
import { CodeBlock } from '../components/CodeBlock'
import { PageHeading } from '../components/PageHeading'

interface DocsContentProps {
  doc: DocSlug
  navigate: (path: string) => void
}

const normativeLevels: Record<string, string> = {
  '必须': 'required',
  '应该': 'recommended',
  '可以': 'allowed',
  '禁止': 'forbidden',
  'MUST': 'required',
  'SHOULD': 'recommended',
  'MAY': 'allowed',
  'MUST NOT': 'forbidden',
}

const codeLanguageLabels: Record<string, string> = {
  bash: 'Shell',
  css: 'CSS',
  html: 'HTML',
  javascript: 'JavaScript',
  js: 'JavaScript',
  json: 'JSON',
  markdown: 'Markdown',
  md: 'Markdown',
  sh: 'Shell',
  ts: 'TypeScript',
  tsx: 'TSX',
  typescript: 'TypeScript',
  jsx: 'JSX',
}

export function DocsContent({ doc, navigate }: DocsContentProps) {
  const { language } = useI18n()
  const document = getDocument(doc, language)
  const labels = getDocGroupLabels(language)

  return (
    <>
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
    </>
  )
}

function TableOfContents({ document }: { document: DocDocument }) {
  const [visibleIds, setVisibleIds] = useState<string[]>([])

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const headerHeight = Number.parseFloat(getComputedStyle(window.document.documentElement).getPropertyValue('--header-height')) || 64
      const threshold = headerHeight + 32
      const viewportBottom = window.innerHeight
      const nextVisibleIds = document.headings
        .map((heading) => window.document.getElementById(heading.id))
        .filter((heading): heading is HTMLElement => Boolean(heading))
        .filter((heading) => {
          const bounds = heading.getBoundingClientRect()
          return bounds.bottom > threshold && bounds.top < viewportBottom
        })
        .map((heading) => heading.id)

      setVisibleIds((currentIds) => (
        currentIds.length === nextVisibleIds.length && currentIds.every((id, index) => id === nextVisibleIds[index])
          ? currentIds
          : nextVisibleIds
      ))
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
        <a
          className={[heading.depth === 3 ? 'depth-3' : '', visibleIds.includes(heading.id) ? 'is-visible' : ''].filter(Boolean).join(' ') || undefined}
          href={`#${heading.id}`}
          aria-current={visibleIds.includes(heading.id) ? 'location' : undefined}
          key={heading.id}
        >
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

  function MarkdownCodeBlock({ children, ...props }: ComponentPropsWithoutRef<'pre'>) {
    const code = Children.toArray(children).find((child): child is React.ReactElement => isValidElement(child))
    const codeProps = code?.props as { className?: string; children?: ReactNode } | undefined
    const language = codeProps?.className?.match(/language-([\w-]+)/)?.[1]
    const label = language ? (codeLanguageLabels[language] ?? language.toUpperCase()) : (document.locale === 'zh-CN' ? '代码' : 'Code')
    const value = String(codeProps?.children ?? '')
    return (
      <CodeBlock code={value} label={label} locale={document.locale === 'zh-CN' ? 'zh' : 'en'}>
        <pre {...props}>{children}</pre>
      </CodeBlock>
    )
  }

  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: heading('h2'),
          h3: heading('h3'),
          pre: MarkdownCodeBlock,
          a: ({ href, children, ...props }) => (
            <a href={href} onClick={(event) => onLink(event, href)} {...props}>{children}</a>
          ),
          strong: ({ children, ...props }) => {
            const level = normativeLevels[String(children)]
            return level
              ? <strong className="normative-level" data-level={level} {...props}>{children}</strong>
              : <strong {...props}>{children}</strong>
          },
        }}
      >
        {document.body}
      </ReactMarkdown>
    </div>
  )
}
