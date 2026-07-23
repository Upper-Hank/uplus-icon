export async function copyText(value: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      let timeoutId: number | undefined
      try {
        await Promise.race([
          navigator.clipboard.writeText(value),
          new Promise<never>((_resolve, reject) => {
            timeoutId = window.setTimeout(() => reject(new Error('Clipboard request timed out')), 800)
          }),
        ])
      } finally {
        window.clearTimeout(timeoutId)
      }
      return true
    }
  } catch {
    // Fall through for browsers that expose Clipboard API but deny access.
  }

  const activeElement = document.activeElement instanceof HTMLElement ? document.activeElement : null
  const textarea = document.createElement('textarea')
  textarea.value = value
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.inset = '0 auto auto -9999px'
  textarea.style.opacity = '0'
  document.body.append(textarea)
  textarea.select()

  try {
    return document.execCommand('copy')
  } catch {
    return false
  } finally {
    textarea.remove()
    activeElement?.focus()
  }
}
