import { Icon, type IconName } from '@uplus-icon/react/dynamic'
import type { IconCategory, IconMeta } from '@uplus-icon/core/metadata'

export type IconViewMode = 'flat' | 'collection'

export type IconGroup = {
  category: IconCategory
  icons: readonly IconMeta[]
}

type CollectionProps = {
  groups: readonly IconGroup[]
  icons: readonly IconMeta[]
  language: 'en' | 'zh'
  navigate: (path: string) => void
  viewMode: IconViewMode
}

export function IconCollection({ groups, icons, language, navigate, viewMode }: CollectionProps) {
  if (viewMode === 'flat') {
    return (
      <div className="icon-collection is-flat" role="region" aria-label={language === 'zh' ? '全部图标' : 'All icons'}>
        <IconGrid icons={icons} navigate={navigate} />
      </div>
    )
  }

  return (
    <div className="icon-collection is-collection">
      {groups.map((group) => (
        <IconCollectionGroup
          group={group}
          language={language}
          navigate={navigate}
          key={group.category.id}
        />
      ))}
    </div>
  )
}

function IconCollectionGroup({ group, language, navigate }: Pick<CollectionProps, 'language' | 'navigate'> & { group: IconGroup }) {
  const title = language === 'zh' ? group.category.titleZh : group.category.title

  return (
    <section className="collection-group" aria-labelledby={`category-${group.category.id}`}>
      <header className="collection-heading">
        <h2 id={`category-${group.category.id}`}>{title}</h2>
        <span>{group.icons.length}</span>
      </header>
      <IconGrid icons={group.icons} navigate={navigate} />
    </section>
  )
}

function IconGrid({ icons, navigate }: { icons: readonly IconMeta[]; navigate: (path: string) => void }) {
  return (
    <div className="collection-grid">
      {icons.map((icon) => <IconGridTile icon={icon} navigate={navigate} key={icon.name} />)}
    </div>
  )
}

function IconGridTile({ icon, navigate }: { icon: IconMeta; navigate: (path: string) => void }) {
  const name = icon.name as IconName
  return (
    <button
      className="icon-grid-tile"
      type="button"
      aria-label={icon.title}
      title={name}
      onClick={() => navigate(`/icons/${name}`)}
    >
      <Icon name={name} size={24} />
    </button>
  )
}
