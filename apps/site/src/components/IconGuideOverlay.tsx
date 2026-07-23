export function IconGuideOverlay() {
  return (
    <svg className="preview-guide-svg" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <g className="guide-safe-area">
        <rect x="3.05" y="3.05" width="17.9" height="17.9" />
        <rect className="guide-wide" x="2.05" y="4.05" width="19.9" height="15.9" />
        <rect className="guide-wide" x="4.05" y="2.05" width="15.9" height="19.9" />
        <circle cx="12" cy="12" r="9.95" />
      </g>
      <path className="guide-axis" d="M3 3L21 21M21 3L3 21M2 12H22M12 2V22" />
      <path className="guide-core" d="M15.9502 8.0498V15.9502H8.0498V8.0498H15.9502Z" />
    </svg>
  )
}
