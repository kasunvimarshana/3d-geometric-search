import React, { useMemo, useRef, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Environment, Grid } from '@react-three/drei'
import * as THREE from 'three'
import { useDispatch, useSelector } from 'react-redux'
import { ModelRegistry } from '../../core/registry/ModelRegistry.js'
import { selectNode } from '../../app/slices/modelSlice.js'
import { attachCameraAndControls } from '../../core/services/fitView.js'

function SceneContent () {
  const dispatch = useDispatch()
  const selectedId = useSelector(s => s.model.selectedNodeId)
  const { camera, gl, scene } = useThree()
  const controls = useRef()

  useEffect(() => {
    if (controls.current) attachCameraAndControls(camera, controls.current)
  }, [camera])

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
  return (
    <div className='viewport'>
      <Canvas camera={{ position: [2, 2, 4], fov: 50 }} dpr={[1, 2]}>
        <SceneContent />
      </Canvas>
    </div>
  )
}
