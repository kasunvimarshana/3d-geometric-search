import React, { useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { loadModelRequested, isolateSection, clearIsolation, highlightNodes, clearHighlights, disassemble, reassemble, refreshScene } from '../../app/slices/modelSlice.js'
import { fitToSelection, fitToAll, toggleFullscreen, resetView, clearCamera } from '../../app/slices/viewerSlice.js'
import { toggleHelp } from '../../app/slices/uiSlice.js'

export default function Toolbar () {
  const dispatch = useDispatch()
  const inputRef = useRef(null)
  const selected = useSelector(s => s.model.selectedNodeId)
  const isolated = useSelector(s => s.model.isolatedNodeId)

  const onFile = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 1) {
      dispatch(loadModelRequested({ file: files[0] }))
    } else if (files.length > 1) {
      dispatch(loadModelRequested({ files }))
    }
    e.target.value = ''
  }
  return (
    <div className='toolbar'>
      <button className='btn' onClick={() => inputRef.current?.click()}>Open Model</button>
      <input ref={inputRef} type='file' accept='.glb,.gltf,.bin,.obj,.mtl,.stl,.stp,.step,.png,.jpg,.jpeg,.gif,.bmp,.webp,.tga,.ktx2,.dds' multiple onChange={onFile} />
      <button className='btn' onClick={() => dispatch(fitToAll())}>Fit All</button>
      {/* <button className='btn' disabled={!selected} onClick={() => dispatch(fitToSelection())}>Fit Selection</button> */}
      <button className='btn' onClick={() => dispatch(resetView())}>Reset View</button>
      <button className='btn' onClick={() => dispatch(toggleFullscreen())}>Fullscreen</button>
      {/* <button className='btn' disabled={!selected} onClick={() => dispatch(isolateSection({ nodeId: selected }))}>Isolate</button> */}
      {/* <button className='btn' disabled={!isolated} onClick={() => dispatch(clearIsolation())}>Clear Isolation</button> */}
      {/* <button className='btn' onClick={() => dispatch(disassemble({ factor: 1 }))}>Disassemble</button> */}
      {/* <button className='btn' onClick={() => dispatch(reassemble())}>Reassemble</button> */}
      {/* <button className='btn' onClick={() => dispatch(refreshScene())}>Refresh</button> */}
      {/* <button className='btn' onClick={() => dispatch(clearCamera())}>Clear Camera</button> */}
      {/* <button className='btn' title='Help (?)' onClick={() => dispatch(toggleHelp())}>?</button> */}
    </div>
  )
}
