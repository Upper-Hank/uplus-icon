import { Component, type ErrorInfo, type ReactNode } from 'react'
import { messages, type Language } from '../i18n'

interface ErrorBoundaryProps {
  children: ReactNode
  language: Language
}

interface ErrorBoundaryState {
  failed: boolean
}

/**
 * Keeps a failed route from blanking the whole site. Lazy route chunks and
 * eagerly parsed documentation are the most likely sources of a runtime error.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { failed: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[uplus-icon site] route failed to render', error, info.componentStack)
  }

  private retry = () => {
    this.setState({ failed: false })
  }

  render() {
    if (!this.state.failed) return this.props.children
    const copy = messages[this.props.language]
    return (
      <section className="route-error" role="alert">
        <h1>{copy.pageError}</h1>
        <p>{copy.pageErrorText}</p>
        <div>
          <button type="button" onClick={this.retry}>{copy.retry}</button>
          <button type="button" onClick={() => window.location.assign('/')}>{copy.goHome}</button>
        </div>
      </section>
    )
  }
}
