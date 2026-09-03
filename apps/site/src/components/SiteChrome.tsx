import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { iconMeta } from '@uplus-icon/core/metadata'
import { useI18n } from '../i18n'
import type { Route } from '../app/router'
import { AppLink } from './AppLink'
import { SegmentedControl } from './LibraryControls'
import { UiIconSlot } from './UiIconSlot'
import { UiIcon } from './UiIcon'
import { SlidingSurface } from './SlidingSurface'

type ThemePreference = 'light' | 'dark' | 'system'

function resolveTheme(preference: ThemePreference) {
  if (preference !== 'system') return preference
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function nextThemePreference(preference: ThemePreference): ThemePreference {
  if (preference === 'light') return 'dark'
  if (preference === 'dark') return 'system'
  return 'light'
}

export function Header({ route, navigate }: { route: Route; navigate: (path: string) => void }) {
  const { language, setLanguage, t } = useI18n()
  const [theme, setTheme] = useState<ThemePreference>(() => {
    const saved = localStorage.getItem('uplus-theme')
    if (saved === 'light' || saved === 'dark' || saved === 'system') return saved
    return 'system'
  })

  useLayoutEffect(() => {
    const applyTheme = () => {
      const resolvedTheme = resolveTheme(theme)
      document.documentElement.dataset.theme = resolvedTheme
      document.querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', resolvedTheme === 'dark' ? '#11110f' : '#f2f2ef')
    }

    applyTheme()
    localStorage.setItem('uplus-theme', theme)

    if (theme !== 'system') return
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', applyTheme)
    return () => mediaQuery.removeEventListener('change', applyTheme)
  }, [theme])

  useEffect(() => {
    const syncTheme = (event: StorageEvent) => {
      if (event.key !== 'uplus-theme') return
      const preference = event.newValue
      setTheme(preference === 'light' || preference === 'dark' || preference === 'system' ? preference : 'system')
    }
    window.addEventListener('storage', syncTheme)
    return () => window.removeEventListener('storage', syncTheme)
  }, [])

  const appearanceOptions = useMemo(() => [
    { value: 'system', label: language === 'zh' ? '跟随系统' : 'System', content: <UiIconSlot name="system"><UiIcon name="system" /></UiIconSlot> },
    { value: 'light', label: language === 'zh' ? '亮色模式' : 'Light mode', content: <UiIconSlot name="sun"><UiIcon name="sun" /></UiIconSlot> },
    { value: 'dark', label: language === 'zh' ? '暗色模式' : 'Dark mode', content: <UiIconSlot name="moon"><UiIcon name="moon" /></UiIconSlot> },
  ] as const, [language])
  const languageOptions = useMemo(() => [
    { value: 'zh', label: '中文', content: <span>中</span> },
    { value: 'en', label: 'English', content: <span>EN</span> },
  ] as const, [])
  const activeNavigation = route.page === 'detail'
    ? 'icons'
    : route.page === 'guide' || route.page === 'changelog'
      ? 'docs'
      : route.page
  const navigationItems = [
    { key: 'home', path: '/', label: t('home'), count: undefined },
    { key: 'icons', path: '/icons', label: t('icons'), count: iconMeta.length },
    { key: 'docs', path: '/docs', label: t('docs'), count: undefined },
  ].map((item) => ({ ...item, active: activeNavigation === item.key }))

  return <header className={`header${route.page === 'icons' || route.page === 'detail' ? ' is-library' : ''}`}>
    <AppLink className="wordmark" to="/" navigate={navigate} aria-label={language === 'zh' ? 'Uplus Icon 首页' : 'Uplus Icon home'}>
      <span className="mark"><img src="/favicon.svg" alt="" /></span><span>Uplus Icon</span>
    </AppLink>
    <nav aria-label={language === 'zh' ? '主导航' : 'Main navigation'}>
      <SlidingSurface activeKey={activeNavigation} className="header-nav-surface">
        {navigationItems.map((item) => (
          <AppLink
            className={item.active ? 'active' : ''}
            to={item.path}
            navigate={navigate}
            data-slide-key={item.key}
            data-motion="none"
            aria-current={item.active ? 'page' : undefined}
            key={item.key}
          >
            {item.label}
            {item.count === undefined ? null : <span className="count">{item.count}</span>}
          </AppLink>
        ))}
      </SlidingSurface>
    </nav>
    <div className="header-tools">
      <SegmentedControl ariaLabel={t('appearance')} options={appearanceOptions} value={theme} onChange={setTheme} />
      <button
        className="header-tool-compact"
        type="button"
        aria-label={language === 'zh' ? `切换至${nextThemePreference(theme) === 'light' ? '亮色模式' : nextThemePreference(theme) === 'dark' ? '暗色模式' : '跟随系统'}` : `Switch to ${nextThemePreference(theme)}`}
        onClick={() => setTheme(nextThemePreference(theme))}
      >
        <UiIconSlot name={theme}><UiIcon name={theme === 'light' ? 'sun' : theme === 'dark' ? 'moon' : 'system'} /></UiIconSlot>
      </button>
      <SegmentedControl ariaLabel={t('languageLabel')} options={languageOptions} value={language} onChange={setLanguage} />
      <button
        className="header-tool-compact"
        type="button"
        aria-label={language === 'zh' ? 'Switch to English' : '切换至中文'}
        onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
      >
        {language === 'zh' ? '中' : 'EN'}
      </button>
    </div>
  </header>
}
