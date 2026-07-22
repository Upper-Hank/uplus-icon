import { useEffect, useMemo, useState } from 'react'
import { iconMeta } from '@uplus-icon/core/metadata'
import { useI18n } from '../i18n'
import type { Route } from '../app/router'
import { SegmentedControl } from './LibraryControls'
import { UiIconSlot } from './UiIconSlot'
import { UiIcon } from './UiIcon'
import { SlidingSurface } from './SlidingSurface'

export function Header({ route, navigate }: { route: Route; navigate: (path: string) => void }) {
  const { language, setLanguage, t } = useI18n()
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('uplus-theme')
    if (saved === 'light' || saved === 'dark') return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('uplus-theme', theme)
  }, [theme])

  const appearanceOptions = useMemo(() => [
    { value: 'light', label: language === 'zh' ? '亮色模式' : 'Light mode', content: <UiIconSlot name="sun"><UiIcon name="sun" /></UiIconSlot> },
    { value: 'dark', label: language === 'zh' ? '暗色模式' : 'Dark mode', content: <UiIconSlot name="moon"><UiIcon name="moon" /></UiIconSlot> },
  ] as const, [language])
  const languageOptions = useMemo(() => [
    { value: 'zh', label: '中文', content: <span>中</span> },
    { value: 'en', label: 'English', content: <span>EN</span> },
  ] as const, [])
  const activeNavigation = route.page === 'detail' ? 'icons' : route.page

  return <header className={`header${route.page === 'icons' || route.page === 'detail' ? ' is-library' : ''}`}>
    <button className="wordmark" onClick={() => navigate('/')} aria-label="Uplus Icon home">
      <span className="mark"><img src="/favicon.svg" alt="" /></span><span>Uplus Icon</span>
    </button>
    <nav aria-label="Main navigation">
      <SlidingSurface activeKey={activeNavigation} className="header-nav-surface">
        <button className={route.page === 'home' ? 'active' : ''} data-slide-key="home" data-motion="none" onClick={() => navigate('/')}>{t('home')}</button>
        <button className={route.page === 'icons' || route.page === 'detail' ? 'active' : ''} data-slide-key="icons" data-motion="none" onClick={() => navigate('/icons')}>{t('icons')} <span className="count">{iconMeta.length}</span></button>
        <button className={route.page === 'docs' ? 'active' : ''} data-slide-key="docs" data-motion="none" onClick={() => navigate('/docs')}>{t('docs')}</button>
      </SlidingSurface>
    </nav>
    <div className="header-tools">
      <SegmentedControl ariaLabel={language === 'zh' ? '外观' : 'Appearance'} options={appearanceOptions} value={theme} onChange={setTheme} />
      <SegmentedControl ariaLabel={language === 'zh' ? '语言' : 'Language'} options={languageOptions} value={language} onChange={setLanguage} />
    </div>
  </header>
}
