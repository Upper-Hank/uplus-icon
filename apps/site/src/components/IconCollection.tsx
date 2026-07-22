import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
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
  const collectionRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const context = gsap.context(() => {
      gsap.fromTo('[data-collection-reveal]', { y: 10, scale: 0.9, opacity: 0 }, {
        y: 0,
        scale: 1,
        opacity: 1,
        duration: 0.35,
        stagger: { amount: 0.8, from: 'start' },
        ease: 'power2.out',
        clearProps: 'transform,opacity',
      })
    }, collectionRef)

    return () => context.revert()
  }, [viewMode])

  if (viewMode === 'flat') {
    return (
      <div className="icon-collection is-flat" ref={collectionRef} role="region" aria-label={language === 'zh' ? '全部图标' : 'All icons'}>
        <IconGrid icons={icons} navigate={navigate} />
      </div>
    )
  }

  return (
    <div className="icon-collection is-collection" ref={collectionRef}>
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
      <header className="collection-heading" data-collection-reveal>
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
      data-collection-reveal
      type="button"
      aria-label={icon.title}
      title={name}
      onClick={() => navigate(`/icons/${name}`)}
    >
      <Icon name={name} size={24} />
    </button>
  )
}
