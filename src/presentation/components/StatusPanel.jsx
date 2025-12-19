import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { ModelRegistry } from '../../core/registry/ModelRegistry.js'
import { computeMetrics } from '../../core/services/metrics.js'

export default function StatusPanel () {
  const modelId = useSelector(s => s.model.modelId)
  const ready = useSelector(s => s.model.status) === 'ready'
  const metrics = useMemo(() => {
    const root = ModelRegistry.getRoot()
    return computeMetrics(root)
  }, [modelId, ready])

  if (!modelId || !ready) return null
  return (
    <div className='overlay' style={{ left: 12, bottom: 12, top: 'auto', right: 'auto' }}>
      <div style={{ display: 'flex', gap: 12 }}>
        <span><strong>Nodes:</strong> {metrics.nodes}</span>
        <span><strong>Meshes:</strong> {metrics.meshes}</span>
        <span><strong>Triangles:</strong> {metrics.triangles.toLocaleString()}</span>
      </div>
    </div>
  )
}
