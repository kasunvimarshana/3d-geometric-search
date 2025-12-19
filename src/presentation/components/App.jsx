import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Toolbar from './Toolbar.jsx'
import TreeView from './TreeView.jsx'
import Viewport from './Viewport.jsx'
import StatusPanel from './StatusPanel.jsx'
import Hotkeys from './Hotkeys.jsx'
import { clearError } from '../../app/slices/modelSlice.js'
import ErrorBoundary from './ErrorBoundary.jsx'

export default function App () {
  const status = useSelector(s => s.model.status)
  const error = useSelector(s => s.model.error)
  const dispatch = useDispatch()

  useEffect(() => {
    if (status === 'error') {
      const t = setTimeout(() => dispatch(clearError()), 5000)
      return () => clearTimeout(t)
    }
  }, [status, dispatch])
  return (
    <div className='layout'>
      <Toolbar />
      <aside className='sidebar'>
        <TreeView />
      </aside>
      <main className='main'>
        <ErrorBoundary>
          <Viewport />
          <Hotkeys />
          <StatusPanel />
        </ErrorBoundary>
        {status === 'loading' && (
          <div className='overlay'>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <strong style={{ color: '#93c5fd' }}>Loading…</strong>
              <span style={{ opacity: 0.9 }}>Parsing model, please wait</span>
            </div>
          </div>
        )}
        {status === 'error' && (
          <div className='overlay'>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <strong style={{ color: '#fca5a5' }}>Error:</strong>
              <span style={{ opacity: 0.9 }}>{String(error)}</span>
              <button className='btn' style={{ marginLeft: 'auto' }} onClick={() => dispatch(clearError())}>×</button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
