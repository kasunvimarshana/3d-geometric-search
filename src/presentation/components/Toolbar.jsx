import React, { useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { loadModelRequested, isolateSection, clearIsolation, highlightNodes, clearHighlights, disassemble, reassemble, refreshScene } from '../../app/slices/modelSlice.js'
import { fitToSelection, fitToAll, toggleFullscreen, resetView } from '../../app/slices/viewerSlice.js'

export default function Toolbar () {
  const dispatch = useDispatch()
  const inputRef = useRef(null)
  const selected = useSelector(s => s.model.selectedNodeId)
  const isolated = useSelector(s => s.model.isolatedNodeId)

  const onFile = (e) => {
    const [file] = e.target.files || []
    if (file) dispatch(loadModelRequested({ file }))
    e.target.value = ''
  }
  return (
    <div className='toolbar'>
      <button className='btn' onClick={() => inputRef.current?.click()}>Open Model</button>
      <input ref={inputRef} type='file' accept='.glb,.gltf,.obj,.stl,.stp,.step' onChange={onFile} />
      <button className='btn' onClick={() => dispatch(fitToAll())}>Fit All</button>
      <button className='btn' disabled={!selected} onClick={() => dispatch(fitToSelection())}>Fit Selection</button>
      <button className='btn' onClick={() => dispatch(resetView())}>Reset View</button>
      <button className='btn' onClick={() => dispatch(toggleFullscreen())}>Fullscreen</button>
      <button className='btn' disabled={!selected} onClick={() => dispatch(isolateSection({ nodeId: selected }))}>Isolate</button>
      <button className='btn' disabled={!isolated} onClick={() => dispatch(clearIsolation())}>Clear Isolation</button>
      <button className='btn' onClick={() => dispatch(disassemble({ factor: 1 }))}>Disassemble</button>
      <button className='btn' onClick={() => dispatch(reassemble())}>Reassemble</button>
      <button className='btn' onClick={() => dispatch(refreshScene())}>Refresh</button>
    </div>
  )
}
