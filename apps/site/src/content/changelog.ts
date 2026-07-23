import changelogEnglish from '../../../../CHANGELOG.md?raw'
import changelogChinese from '../../../../CHANGELOG.zh-CN.md?raw'

export interface ChangelogVersion {
  id: string
  label: string
}

export interface ChangelogDocument {
  body: string
  versions: ChangelogVersion[]
}

export function changelogVersionId(label: string) {
  const version = label.match(/\[([^\]]+)\]/)?.[1] ?? label.split(/\s+-\s+/)[0]
  return version.toLocaleLowerCase().replace(/[^a-z0-9.-]+/g, '-').replace(/^-|-$/g, '')
}

function parseChangelog(source: string): ChangelogDocument {
  const body = source.replace(/^#\s+.+?\r?\n+/, '').trim()
  const versions = [...body.matchAll(/^##\s+(.+?)\s*$/gm)].map((match) => ({
    id: changelogVersionId(match[1]),
    label: match[1],
  }))
  if (!versions.length) throw new Error('Changelog must contain at least one version heading')
  return { body, versions }
}

const changelogs = {
  en: parseChangelog(changelogEnglish),
  zh: parseChangelog(changelogChinese),
} as const

export function getChangelog(language: 'en' | 'zh') {
  return changelogs[language]
}
