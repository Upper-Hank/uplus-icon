import { useEffect } from 'react'
import { iconMeta } from '@uplus-icon/core/metadata'
import type { Language } from '../i18n'
import type { Route } from './router'

const siteUrl = 'https://icon.upper.website'

function setMeta(selector: string, attributes: Record<string, string>, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector)
  if (!element) {
    element = document.createElement('meta')
    for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value)
    document.head.append(element)
  }
  element.content = content
}

function routeMetadata(route: Route, language: Language) {
  const zh = language === 'zh'
  if (route.page === 'detail') {
    const icon = iconMeta.find(({ name }) => name === route.name)
    const label = zh ? icon?.titleZh : icon?.title
    return {
      title: `${label ?? route.name} (${route.name}) — Uplus Icon`,
      description: zh
        ? `查看 ${route.name} 图标、预览不同尺寸并复制 React、Core 或 SVG 用法。`
        : `Preview the ${route.name} icon and copy its React, Core, or SVG usage.`,
      robots: 'index,follow',
    }
  }

  const values = {
    home: {
      title: zh ? 'Uplus Icon — 官方界面图标库' : 'Uplus Icon — A quiet icon library',
      description: zh ? '类型安全、可按需加载的 Uplus 官方界面图标库。' : 'The official type-safe, tree-shakeable interface icon library for Uplus.',
    },
    icons: {
      title: zh ? '图标库 — Uplus Icon' : 'Icon library — Uplus Icon',
      description: zh ? '搜索、浏览、预览并复制 Uplus 图标。' : 'Search, browse, preview, and copy Uplus icons.',
    },
    guide: {
      title: zh ? '使用指南 — Uplus Icon' : 'Get started — Uplus Icon',
      description: zh ? '安装并在 React 项目中使用 Uplus Icon。' : 'Install and use Uplus Icon in React projects.',
    },
    docs: {
      title: zh ? '规范文档 — Uplus Icon' : 'Documentation — Uplus Icon',
      description: zh ? 'Uplus Icon 的设计、工程、无障碍和发布规范。' : 'Design, engineering, accessibility, and release rules for Uplus Icon.',
    },
    changelog: {
      title: zh ? '更新日志 — Uplus Icon' : 'Changelog — Uplus Icon',
      description: zh ? '查看 Uplus Icon 的版本与变更记录。' : 'Review Uplus Icon versions and release changes.',
    },
    'not-found': {
      title: zh ? '页面未找到 — Uplus Icon' : 'Page not found — Uplus Icon',
      description: zh ? '请求的 Uplus Icon 页面不存在。' : 'The requested Uplus Icon page does not exist.',
    },
  } as const

  const key = route.page === 'docs' ? 'docs' : route.page
  return { ...values[key], robots: key === 'not-found' ? 'noindex,nofollow' : 'index,follow' }
}

export function useDocumentMetadata(route: Route, language: Language) {
  useEffect(() => {
    const metadata = routeMetadata(route, language)
    const path = route.page === 'home'
      ? '/'
      : route.page === 'icons'
        ? '/icons'
        : route.page === 'detail'
          ? `/icons/${encodeURIComponent(route.name)}`
          : route.page === 'docs'
            ? route.doc === 'principles' ? '/docs' : `/docs/${route.doc}`
            : route.page === 'not-found'
              ? window.location.pathname
              : `/${route.page}`
    const canonicalUrl = new URL(path, siteUrl).href

    document.title = metadata.title
    setMeta('meta[name="description"]', { name: 'description' }, metadata.description)
    setMeta('meta[name="robots"]', { name: 'robots' }, metadata.robots)
    setMeta('meta[property="og:title"]', { property: 'og:title' }, metadata.title)
    setMeta('meta[property="og:description"]', { property: 'og:description' }, metadata.description)
    setMeta('meta[property="og:url"]', { property: 'og:url' }, canonicalUrl)
    setMeta('meta[property="og:image"]', { property: 'og:image' }, `${siteUrl}/og.svg`)
    setMeta('meta[property="og:locale"]', { property: 'og:locale' }, language === 'zh' ? 'zh_CN' : 'en_US')
    setMeta('meta[property="og:locale:alternate"]', { property: 'og:locale:alternate' }, language === 'zh' ? 'en_US' : 'zh_CN')
    setMeta('meta[name="twitter:card"]', { name: 'twitter:card' }, 'summary_large_image')
    setMeta('meta[name="twitter:image"]', { name: 'twitter:image' }, `${siteUrl}/og.svg`)

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.append(canonical)
    }
    canonical.href = canonicalUrl

    const hreflang = [
      { hreflang: 'en', href: canonicalUrl },
      { hreflang: 'zh-CN', href: canonicalUrl },
      { hreflang: 'x-default', href: canonicalUrl },
    ]
    for (const alternate of hreflang) {
      const selector = `link[rel="alternate"][hreflang="${alternate.hreflang}"]`
      let link = document.head.querySelector<HTMLLinkElement>(selector)
      if (!link) {
        link = document.createElement('link')
        link.rel = 'alternate'
        link.hreflang = alternate.hreflang
        document.head.append(link)
      }
      link.href = alternate.href
    }
  }, [language, route])
}
