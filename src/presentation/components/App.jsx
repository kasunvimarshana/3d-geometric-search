import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Toolbar from './Toolbar.jsx'
import TreeView from './TreeView.jsx'
import Viewport from './Viewport.jsx'

export default function App () {
  const status = useSelector(s => s.model.status)
  const error = useSelector(s => s.model.error)
  return (
    <div className='layout'>
      <Toolbar />
      <aside className='sidebar'>
        <TreeView />
      </aside>
      <main className='main'>
        <Viewport />
        {status === 'error' && (
          <div className='overlay'>Error: {String(error)}</div>
        )}
      </main>
    </div>
  )
}
