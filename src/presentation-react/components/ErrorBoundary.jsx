import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught:', error, info)
  }

  reset = () => this.setState({ hasError: false, error: null })

  render() {
    if (this.state.hasError) {
      return (
        <div className='overlay'>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, maxWidth: 720 }}>
            <strong style={{ color: '#fca5a5' }}>Viewer Error</strong>
            <span style={{ opacity: 0.9, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {String(this.state.error)}
            </span>
            <button className='btn' style={{ marginLeft: 'auto' }} onClick={this.reset}>Retry</button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
