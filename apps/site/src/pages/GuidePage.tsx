import { PageHeading } from '../components/PageHeading'
import { useI18n } from '../i18n'

export function GuideContent({ navigate }: { navigate: (path: string) => void }) {
  const { language } = useI18n()
  const zh = language === 'zh'

  return (
    <>
      <article className="docs-article guide-article" data-reveal>
        <PageHeading
          label={zh ? '快速开始' : 'Quick start'}
          title={zh ? '使用指南' : 'Get started'}
          description={zh
            ? '从安装到渲染第一个 Uplus Icon，只需要几分钟。'
            : 'Install Uplus Icon and render your first icon in a few minutes.'}
          meta={<><span>React</span><span>TypeScript</span><span>Tree-shakable</span></>}
        />

        <div className="markdown-body guide-body">
          <section id="install">
            <h2>{zh ? '安装' : 'Install'}</h2>
            <p>{zh ? '安装 React 图标包。' : 'Install the React icon package.'}</p>
            <CodeBlock>npm install @uplus-icon/react</CodeBlock>
          </section>

          <section id="named-components">
            <h2>{zh ? '使用具名组件' : 'Use a named component'}</h2>
            <p>{zh
              ? '已知图标名称时，优先使用具名导入，以获得清晰的类型和最小的打包结果。'
              : 'Prefer a named import when the icon is known ahead of time for clear types and the smallest bundle.'}</p>
            <CodeBlock>{`import { CheckIcon } from '@uplus-icon/react'

export function Confirmed() {
  return <CheckIcon size={20} aria-label="${zh ? '已确认' : 'Confirmed'}" />
}`}</CodeBlock>
          </section>

          <section id="dynamic-icons">
            <h2>{zh ? '按名称动态渲染' : 'Render by name'}</h2>
            <p>{zh
              ? '图标名称来自配置或数据时，使用动态入口。'
              : 'Use the dynamic entry when the icon name comes from configuration or data.'}</p>
            <CodeBlock>{`import { Icon } from '@uplus-icon/react/dynamic'

<Icon name="check" size={20} />`}</CodeBlock>
          </section>

          <section id="next">
            <h2>{zh ? '深入了解' : 'Go deeper'}</h2>
            <div className="guide-links">
              <GuideLink
                title={zh ? 'React 使用' : 'React usage'}
                description={zh ? '组件属性、ref、线宽和类型。' : 'Component props, refs, stroke width, and types.'}
                onClick={() => navigate('/docs/react')}
              />
              <GuideLink
                title={zh ? 'Web 使用' : 'Web usage'}
                description={zh ? '原生 DOM API 与 Web Component。' : 'Native DOM APIs and the Web Component.'}
                onClick={() => navigate('/docs/web')}
              />
              <GuideLink
                title={zh ? '可访问性' : 'Accessibility'}
                description={zh ? '装饰图标与语义图标的正确标注。' : 'Correct labeling for decorative and semantic icons.'}
                onClick={() => navigate('/docs/accessibility')}
              />
            </div>
          </section>
        </div>
      </article>

      <aside className="docs-toc-desktop">
        <nav aria-label={zh ? '本页目录' : 'On this page'}>
          <a href="#install">{zh ? '安装' : 'Install'}</a>
          <a href="#named-components">{zh ? '使用具名组件' : 'Use a named component'}</a>
          <a href="#dynamic-icons">{zh ? '按名称动态渲染' : 'Render by name'}</a>
          <a href="#next">{zh ? '深入了解' : 'Go deeper'}</a>
        </nav>
      </aside>
    </>
  )
}

function CodeBlock({ children }: { children: string }) {
  return (
    <div className="markdown-code-block">
      <div className="markdown-code-head"><span>Code</span></div>
      <pre><code>{children}</code></pre>
    </div>
  )
}

function GuideLink({ description, onClick, title }: { description: string; onClick: () => void; title: string }) {
  return (
    <button type="button" onClick={onClick}>
      <strong>{title}</strong>
      <span>{description}</span>
    </button>
  )
}
