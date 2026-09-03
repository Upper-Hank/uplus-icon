import { Icon, type IconName } from '@uplus-icon/react/dynamic'
import type { IconCategory, IconMeta, IconSubgroup } from '@uplus-icon/core/metadata'
import { useEffect, useRef, useState } from 'react'
import { AppLink } from './AppLink'

export type IconViewMode = 'flat' | 'collection'

export type IconSubgroupGroup = {
  subgroup: IconSubgroup
  icons: readonly IconMeta[]
}

export type IconGroup = {
  category: IconCategory
  subgroups: readonly IconSubgroupGroup[]
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
        <IconGrid icons={icons} language={language} navigate={navigate} />
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
      <div className="collection-subgroups">
        {group.subgroups.map(({ subgroup, icons }) => (
          <IconSubgroupSection
            categoryId={group.category.id}
            icons={icons}
            language={language}
            navigate={navigate}
            subgroup={subgroup}
            key={`${group.category.id}-${subgroup.id}`}
          />
        ))}
      </div>
    </section>
  )
}

function IconSubgroupSection({
  categoryId,
  icons,
  language,
  navigate,
  subgroup,
}: {
  categoryId: string
  icons: readonly IconMeta[]
  language: 'en' | 'zh'
  navigate: (path: string) => void
  subgroup: IconSubgroup
}) {
  const title = language === 'zh' ? subgroup.titleZh : subgroup.title
  const headingId = `subgroup-${categoryId}-${subgroup.id}`

  return (
    <section className="collection-subgroup" aria-labelledby={headingId}>
      <header className="collection-subheading">
        <h3 id={headingId}>{title}</h3>
        <span>{icons.length}</span>
      </header>
      <IconGrid icons={icons} language={language} navigate={navigate} />
    </section>
  )
}

function IconGrid({ icons, language, navigate }: { icons: readonly IconMeta[]; language: 'en' | 'zh'; navigate: (path: string) => void }) {
  const { ref, start, end, padTop, padBottom } = useVisibleGridWindow(icons.length)

  return (
    <div className="collection-grid" ref={ref} style={{ paddingTop: padTop, paddingBottom: padBottom }}>
      {icons.slice(start, end).map((icon) => (
        <IconGridTile icon={icon} language={language} navigate={navigate} key={icon.name} />
      ))}
    </div>
  )
}

const TILE = 48
const GAP = 16
const OVERSCAN_ROWS = 4

function useVisibleGridWindow(itemCount: number) {
  const ref = useRef<HTMLDivElement>(null)
  const [range, setRange] = useState({ start: 0, end: Math.min(itemCount, 80), padTop: 0, padBottom: 0 })

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const update = () => {
      const columns = Math.max(1, Math.floor((node.clientWidth + GAP) / (TILE + GAP)))
      const rowHeight = TILE + GAP
      const totalRows = Math.max(1, Math.ceil(itemCount / columns))
      const bounds = node.getBoundingClientRect()
      const viewportTop = Math.max(0, -bounds.top)
      const viewportBottom = viewportTop + window.innerHeight
      const startRow = Math.max(0, Math.floor(viewportTop / rowHeight) - OVERSCAN_ROWS)
      const endRow = Math.min(totalRows, Math.ceil(viewportBottom / rowHeight) + OVERSCAN_ROWS)
      const start = startRow * columns
      const end = Math.min(itemCount, endRow * columns)
      setRange({
        start,
        end,
        padTop: startRow * rowHeight,
        padBottom: Math.max(0, (totalRows - endRow) * rowHeight),
      })
    }

    update()
    const observer = new ResizeObserver(update)
    observer.observe(node)
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [itemCount])

  return { ref, ...range }
}

function IconGridTile({ icon, language, navigate }: { icon: IconMeta; language: 'en' | 'zh'; navigate: (path: string) => void }) {
  const name = icon.name as IconName
  return (
    <AppLink
      className="icon-grid-tile"
      to={`/icons/${name}`}
      navigate={navigate}
      aria-label={language === 'zh' ? icon.titleZh : icon.title}
      title={name}
    >
      <Icon name={name} size={24} />
    </AppLink>
  )
}
