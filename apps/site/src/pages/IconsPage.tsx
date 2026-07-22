import { useEffect, useMemo, useRef, useState } from 'react'
import { Icon, type IconName } from '@uplus-icon/react/dynamic'
import { iconCategories, iconMeta } from '@uplus-icon/core/metadata'
import { useI18n } from '../i18n'
import { IconCollection, type IconViewMode } from '../components/IconCollection'
import { SegmentedControl } from '../components/LibraryControls'
import { UiIconSlot } from '../components/UiIconSlot'
import { IconDetailDrawer } from '../components/IconDetailDrawer'
import { UiIcon } from '../components/UiIcon'
import { SelectMenu } from '../components/SelectMenu'

type SortOrder = 'published' | 'name'

interface IconsPageProps {
  navigate: (path: string) => void
  selectedIcon?: IconName
}

export function IconsPage({ navigate, selectedIcon }: IconsPageProps) {
  const { language, t } = useI18n()
  const [query, setQuery] = useState('')
  const [sortOrder, setSortOrder] = useState<SortOrder>('published')
  const [viewMode, setViewMode] = useState<IconViewMode>(() => localStorage.getItem('uplus-icon-view') === 'collection' ? 'collection' : 'flat')
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    localStorage.setItem('uplus-icon-view', viewMode)
  }, [viewMode])

  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', focusSearch)
    return () => window.removeEventListener('keydown', focusSearch)
  }, [])

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase()
    const matches = iconMeta.map((icon, index) => ({ icon, index })).filter(({ icon: { name, title, titleZh, tags, aliases, categories } }) => {
      if (!value) return true
      const categoryTerms = iconCategories
        .filter(({ id }) => categories.includes(id))
        .flatMap(({ id, title: categoryTitle, titleZh: categoryTitleZh }) => [id, categoryTitle, categoryTitleZh])
      return [name, title, titleZh, ...tags, ...aliases, ...categoryTerms].some((term) => term.toLowerCase().includes(value))
    })
    matches.sort((a, b) => {
      if (sortOrder === 'name') return a.icon.name.localeCompare(b.icon.name) || a.index - b.index
      const byVersion = (b.icon.publishedIn ?? '').localeCompare(a.icon.publishedIn ?? '', undefined, { numeric: true })
      return byVersion || a.index - b.index
    })
    return matches.map(({ icon }) => icon)
  }, [query, sortOrder])

  const groups = useMemo(() => {
    return iconCategories.map((entry) => ({
      category: entry,
      icons: filtered.filter((icon) => icon.categories[0] === entry.id),
    })).filter(({ icons }) => icons.length > 0)
  }, [filtered])

  const viewOptions = useMemo(() => [
    { value: 'flat', label: language === 'zh' ? '完全平铺' : 'Flat view', content: <UiIconSlot name="flat"><UiIcon name="grid" /></UiIconSlot> },
    { value: 'collection', label: language === 'zh' ? '集合形式' : 'Collection view', content: <UiIconSlot name="collection"><UiIcon name="list" /></UiIconSlot> },
  ] as const, [language])
  const sortOptions = useMemo(() => [
    { value: 'published', label: language === 'zh' ? '按发布时间' : 'Published' },
    { value: 'name', label: language === 'zh' ? '按名称' : 'Name' },
  ] as const, [language])

  return <section className="library-page">
    <div className="library-toolbar" data-reveal>
      <div className="icon-search" role="search">
        {query
          ? <button className="search-clear" type="button" aria-label={language === 'zh' ? '清除搜索' : 'Clear search'} onClick={() => {
            setQuery('')
            searchRef.current?.focus()
          }}><Icon name="close" size={18} /></button>
          : <UiIconSlot name="search"><UiIcon name="search" /></UiIconSlot>}
        <input
          ref={searchRef}
          aria-label={language === 'zh' ? '搜索图标' : 'Search icons'}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={language === 'zh' ? '搜索Icon' : 'Search icons'}
        />
      </div>
      <div className="library-toolbar-actions">
        <SelectMenu
          ariaLabel={language === 'zh' ? '图标排序' : 'Sort icons'}
          options={sortOptions}
          value={sortOrder}
          onChange={setSortOrder}
        />
        <SegmentedControl
          ariaLabel={language === 'zh' ? '内容布局' : 'Content layout'}
          className="view-control"
          options={viewOptions}
          value={viewMode}
          onChange={setViewMode}
        />
      </div>
    </div>
    {filtered.length ? <IconCollection groups={groups} icons={filtered} language={language} navigate={navigate} viewMode={viewMode} />
      : <div className="empty"><Icon name="grid" size={32} /><h2>{t('noIcon')}</h2><p>{t('noIconText')}</p></div>}
    {selectedIcon && <IconDetailDrawer key={selectedIcon} name={selectedIcon} onClose={() => navigate('/icons')} />}
  </section>
}
