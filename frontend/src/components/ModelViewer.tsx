import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Stage } from '@react-three/drei'
import * as THREE from 'three'

interface ModelViewerProps {
  modelUrl?: string
  geometry?: THREE.BufferGeometry
  className?: string
}

const ModelMesh: React.FC<{ geometry?: THREE.BufferGeometry }> = ({ geometry }) => {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005
    }
  })

  if (!geometry) {
    // Default box if no geometry provided
    return (
      <mesh ref={meshRef}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#0ea5e9" />
      </mesh>
    )
  }

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial
        color="#0ea5e9"
        metalness={0.3}
        roughness={0.4}
      />
    </mesh>
  )
}

const ModelViewer: React.FC<ModelViewerProps> = ({ geometry, className = '' }) => {
  return (
    <div className={`w-full h-full bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden ${className}`}>
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <Stage environment="city" intensity={0.5}>
          <ModelMesh geometry={geometry} />
        </Stage>
        <OrbitControls makeDefault />
      </Canvas>
    </div>
  )
}

export default ModelViewer
