import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Icon } from '@uplus-icon/react/dynamic'
import { copyText } from '../app/copyText'

interface CodeBlockProps {
  children: ReactNode
  code: string
  label: string
  locale: 'en' | 'zh'
}

export function CodeBlock({ children, code, label, locale }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const [copyFailed, setCopyFailed] = useState(false)
  const copyTimerRef = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(copyTimerRef.current), [])

  const copy = async () => {
    const success = await copyText(code)
    setCopied(success)
    setCopyFailed(!success)
    window.clearTimeout(copyTimerRef.current)
    copyTimerRef.current = window.setTimeout(() => {
      setCopied(false)
      setCopyFailed(false)
    }, 1600)
  }

  const copyLabel = copyFailed
    ? (locale === 'zh' ? '复制失败' : 'Copy failed')
    : copied
      ? (locale === 'zh' ? '已复制' : 'Copied')
      : (locale === 'zh' ? '复制代码' : 'Copy code')

  return (
    <div className="markdown-code-block">
      <div className="markdown-code-head">
        <span>{label}</span>
        <button className="markdown-code-copy" type="button" onClick={copy} aria-label={copyLabel} title={copyLabel}>
          <Icon name={copied ? 'check' : 'copy'} size={14} />
        </button>
      </div>
      {children}
    </div>
  )
}
