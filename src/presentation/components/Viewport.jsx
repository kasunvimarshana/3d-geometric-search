import React, { useMemo, useRef, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Environment, Grid } from '@react-three/drei'
import * as THREE from 'three'
import { useDispatch, useSelector } from 'react-redux'
import { ModelRegistry } from '../../core/registry/ModelRegistry.js'
import { selectNode, loadModelRequested } from '../../app/slices/modelSlice.js'
import { attachCameraAndControls } from '../../core/services/fitView.js'
import { setCamera } from '../../app/slices/viewerSlice.js'
import { arraysAlmostEqual as eq } from '../utils/arrayUtils.js'

function SceneContent () {
  const dispatch = useDispatch()
  const selectedId = useSelector(s => s.model.selectedNodeId)
  const savedCam = useSelector(s => s.viewer.camera)
  const { camera, gl, scene } = useThree()
  const controls = useRef()
  // Prevent feedback loop between applying saved camera and persisting changes
  const applyingCameraRef = useRef(false)
  // Coalesce rapid OrbitControls change events to at most once per frame
  const rafIdRef = useRef(null)

  useEffect(() => {
    if (controls.current) attachCameraAndControls(camera, controls.current)
  }, [camera])

  // Persist camera on changes
  useEffect(() => {
    const ctr = controls.current
    if (!ctr) return
    const onChange = () => {
      if (applyingCameraRef.current) return
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current)
      rafIdRef.current = requestAnimationFrame(() => {
        const p = camera.position
        const t = ctr.target
        const nextPos = [p.x, p.y, p.z]
        const nextTgt = [t.x, t.y, t.z]
        const cur = savedCam || {}
        if (eq(nextPos, cur.position) && eq(nextTgt, cur.target)) return
        dispatch(setCamera({ position: nextPos, target: nextTgt }))
      })
    }
    ctr.addEventListener('change', onChange)
    return () => {
      ctr.removeEventListener('change', onChange)
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current)
      rafIdRef.current = null
    }
  }, [camera, controls, dispatch, savedCam])

  // Apply saved camera
  useEffect(() => {
    if (!savedCam || !controls.current) return
    const { position, target } = savedCam
    const ctr = controls.current
    const curPos = [camera.position.x, camera.position.y, camera.position.z]
    const curTgt = [ctr.target.x, ctr.target.y, ctr.target.z]
    const posChanged = Array.isArray(position) && !eq(position, curPos)
    const tgtChanged = Array.isArray(target) && !eq(target, curTgt)
    if (!posChanged && !tgtChanged) return
    applyingCameraRef.current = true
    try {
      if (posChanged) camera.position.set(...position)
      if (tgtChanged) ctr.target.set(...target)
      ctr.update()
    } finally {
      // Release flag on next frame to ignore the update-induced 'change'
      requestAnimationFrame(() => { applyingCameraRef.current = false })
    }
  }, [savedCam, camera])

  useFrame(() => {
    // Keep renderer fresh
  })

  const onPointerDown = (e) => {
    const rect = gl.domElement.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1
    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera({ x, y }, camera)
    const root = ModelRegistry.getRoot()
    if (!root) return
    const intersects = raycaster.intersectObjects(root.children, true)
    if (intersects.length) {
      const obj = intersects[0].object
      const id = obj.userData.__nodeId
      if (id) dispatch(selectNode({ nodeId: id }))
    }
  }

  return (
    <group onPointerDown={onPointerDown}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 7]} intensity={0.8} />
      <Environment preset='city' />
      <Grid args={[20, 20]} cellColor={'#222a3b'} sectionColor={'#2a3246'} infiniteGrid fadeDistance={30} fadeStrength={2} />
      <OrbitControls ref={controls} makeDefault enableDamping dampingFactor={0.1} />
      <ModelRoot />
    </group>
  )
}

function ModelRoot () {
  const ref = useRef()
  const modelReady = !!ModelRegistry.getRoot()
  // Attach Three.js object to scene when present
  useFrame(() => {
    if (ref.current && ModelRegistry.getRoot() && !ref.current.children.includes(ModelRegistry.getRoot())) {
      ref.current.add(ModelRegistry.getRoot())
    }
  })
  return <group ref={ref} />
}

export default function Viewport () {
  const dispatch = useDispatch()
  const [dragging, setDragging] = React.useState(false)
  const hasModel = useSelector(s => !!s.model.tree)

  const prevent = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const onDragEnter = (e) => { prevent(e); setDragging(true) }
  const onDragOver = (e) => { prevent(e); setDragging(true) }
  const onDragLeave = (e) => { prevent(e); setDragging(false) }
  const onDrop = (e) => {
    prevent(e)
    setDragging(false)
    const files = Array.from(e.dataTransfer?.files || [])
    if (files.length === 1) dispatch(loadModelRequested({ file: files[0] }))
    else if (files.length > 1) dispatch(loadModelRequested({ files }))
  }

  return (
    <div className='viewport'
         onDragEnter={onDragEnter}
         onDragOver={onDragOver}
         onDragLeave={onDragLeave}
         onDrop={onDrop}>
      <Canvas camera={{ position: [2, 2, 4], fov: 50 }} dpr={[1, 2]}>
        <SceneContent />
      </Canvas>
      {dragging && (
        <div className='overlay' style={{ pointerEvents: 'none' }}>{/* Drop files to load */}</div>
      )}
      {!hasModel && !dragging && (
        <div className='dropzone'>
          <div>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>{/*Drop files to load*/}</div>
            <div style={{ opacity: 0.8 }}>{/*Supports .glb, .gltf, .obj+.mtl (+textures), .stl, .stp/.step*/}</div>
          </div>
        </div>
      )}
    </div>
  )
}
