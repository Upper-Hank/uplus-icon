import type { ReactNode } from 'react'

export function PageHeading({
  actions,
  description,
  label,
  meta,
  title,
  titleId,
}: {
  actions?: ReactNode
  description?: ReactNode
  label: ReactNode
  meta?: ReactNode
  title: ReactNode
  titleId?: string
}) {
  return (
    <header className="page-heading">
      <div className="page-heading-copy">
        <p className="page-heading-label">{label}</p>
        <h1 id={titleId}>{title}</h1>
        {description && <p className="page-heading-description">{description}</p>}
        {meta && <div className="page-heading-meta">{meta}</div>}
      </div>
      {actions && <div className="page-heading-actions">{actions}</div>}
    </header>
  )
}
