import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toggleHelp } from '../../app/slices/uiSlice.js'
import { fitToAll, fitToSelection, resetView } from '../../app/slices/viewerSlice.js'
import { isolateSection, clearIsolation } from '../../app/slices/modelSlice.js'

function isTypingTarget(t) {
  if (!t) return false
  const tag = (t.tagName || '').toLowerCase()
  return tag === 'input' || tag === 'textarea' || t.isContentEditable
}

export default function Hotkeys () {
  const dispatch = useDispatch()
  const helpVisible = useSelector(s => s.ui.help.visible)
  const selected = useSelector(s => s.model.selectedNodeId)
  const isolated = useSelector(s => s.model.isolatedNodeId)

  useEffect(() => {
    const onKeyDown = (e) => {
      if (isTypingTarget(e.target)) return
      const key = e.key
      if ((key === '?' || (key === '/' && e.shiftKey))) {
        e.preventDefault()
        dispatch(toggleHelp())
        return
      }
      if (key === 'f' || key === 'F') {
        e.preventDefault()
        if (selected) dispatch(fitToSelection())
        else dispatch(fitToAll())
        return
      }
      if (key === 'a' || key === 'A') {
        e.preventDefault()
        dispatch(fitToAll())
        return
      }
      if (key === 'i' || key === 'I') {
        if (selected) {
          e.preventDefault()
          dispatch(isolateSection({ nodeId: selected }))
        }
        return
      }
      if (key === 'Escape' || key === 'e' || key === 'E') {
        if (isolated) {
          e.preventDefault()
          dispatch(clearIsolation())
        }
        return
      }
      if (key === 'r' || key === 'R') {
        e.preventDefault()
        dispatch(resetView())
        return
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [dispatch, selected, isolated])

  if (!helpVisible) return null
  return (
    <div className='overlay' style={{ left: 12, top: 56, right: 'auto' }}>
      <div style={{ fontWeight: 600, marginBottom: 6 }}>Shortcuts</div>
      <div>?: Toggle help</div>
      <div>F: Fit selection (or all)</div>
      <div>A: Fit all</div>
      <div>I: Isolate selection</div>
      <div>Esc: Clear isolation</div>
      <div>R: Reset view</div>
    </div>
  )
}
