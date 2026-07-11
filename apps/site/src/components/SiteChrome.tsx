import { useEffect, useState } from 'react'
import { Icon } from 'uplus-icon/dynamic'
import { iconMeta } from 'uplus-icon/metadata'
import { useI18n } from '../i18n'
import type { Route } from '../app/router'

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

  return <header className="header">
    <button className="wordmark" onClick={() => navigate('/')} aria-label="Uplus Icon home">
      <span className="mark"><img src="/favicon.svg" alt="" /></span><span>Uplus Icon</span>
    </button>
    <nav aria-label="Main navigation">
      <button className={route.page === 'home' ? 'active' : ''} onClick={() => navigate('/')}>{t('home')}</button>
      <button className={route.page === 'icons' || route.page === 'detail' ? 'active' : ''} onClick={() => navigate('/icons')}>{t('icons')} <span className="count">{iconMeta.length}</span></button>
      <button className={route.page === 'docs' ? 'active' : ''} onClick={() => navigate('/docs')}>{t('docs')}</button>
    </nav>
    <div className="header-tools">
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} title="Appearance"><Icon name={theme === 'light' ? 'moon' : 'sun'} size={17} /></button>
      <button className="language-toggle" onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')} aria-label="Switch language" title="Language"><Icon name="globe" size={16} /><span>{language === 'en' ? 'EN' : '中文'}</span></button>
    </div>
  </header>
}

export function Footer() {
  return <footer><span>v0.1.0</span><span>@2026</span></footer>
}
