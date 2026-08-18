import { useEffect, useState, type ComponentPropsWithoutRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { PageHeading } from '../components/PageHeading'
import { SelectMenu } from '../components/SelectMenu'
import { currentVersionLabel } from '../app/releaseInfo'
import { changelogVersionId, getChangelog } from '../content/changelog'
import { useI18n } from '../i18n'

function readVersionFromHash(versions: readonly { id: string }[]) {
  const hash = window.location.hash.slice(1)
  return versions.some((version) => version.id === hash) ? hash : versions[0].id
}

export function ChangelogContent() {
  const { language } = useI18n()
  const changelog = getChangelog(language)
  const [activeVersion, setActiveVersion] = useState(() => readVersionFromHash(changelog.versions))
  const versionOptions = changelog.versions.map((version) => ({ value: version.id, label: version.label }))

  useEffect(() => {
    const version = readVersionFromHash(changelog.versions)
    setActiveVersion(version)
    if (window.location.hash.slice(1) !== version) {
      window.history.replaceState({}, '', `#${version}`)
    }
  }, [changelog])

  const selectVersion = (version: string) => {
    setActiveVersion(version)
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
    window.document.getElementById(version)?.scrollIntoView({ behavior, block: 'start' })
    window.history.replaceState({}, '', `#${version}`)
  }

  const versionHeading = ({ children, ...props }: ComponentPropsWithoutRef<'h2'>) => {
    const label = String(children)
    const id = changelogVersionId(label)
    return <h2 id={id} {...props}>{children}</h2>
  }

  return (
    <>
      <article className="docs-article" data-reveal>
        <PageHeading
          label={language === 'zh' ? '版本记录' : 'Release history'}
          title={language === 'zh' ? '更新日志' : 'Changelog'}
          description={language === 'zh' ? '记录 Uplus Icon 从第一个公开 Beta 开始的版本变化。' : 'Uplus Icon release history starting with the first public beta.'}
          meta={<span>{language === 'zh' ? `最新版本 · ${currentVersionLabel}` : `Latest · ${currentVersionLabel}`}</span>}
        />
        <div className="changelog-version-select">
          <SelectMenu ariaLabel={language === 'zh' ? '选择版本' : 'Select version'} options={versionOptions} value={activeVersion} onChange={selectVersion} />
        </div>
        <div className="markdown-body changelog-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ h2: versionHeading }}>
            {changelog.body}
          </ReactMarkdown>
        </div>
      </article>

      <aside className="docs-toc-desktop changelog-versions">
        <nav aria-label={language === 'zh' ? '版本目录' : 'Versions'}>
          {changelog.versions.map((version) => (
            <a
              href={`#${version.id}`}
              aria-current={activeVersion === version.id ? 'location' : undefined}
              onClick={(event) => {
                event.preventDefault()
                selectVersion(version.id)
              }}
              key={version.id}
            >
              {version.label}
            </a>
          ))}
        </nav>
      </aside>
    </>
  )
}
