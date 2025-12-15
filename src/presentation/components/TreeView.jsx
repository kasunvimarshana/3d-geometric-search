import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectNode } from '../../app/slices/modelSlice.js'

function Node ({ node, selectedId, onSelect }) {
  const selected = selectedId === node.id
  return (
    <li className={selected ? 'selected' : ''} onClick={() => onSelect(node.id)}>
      {node.name}
      {node.children?.length ? (
        <ul className='tree'>
          {node.children.map((c) => (
            <Node key={c.id} node={c} selectedId={selectedId} onSelect={onSelect} />
          ))}
        </ul>
      ) : null}
    </li>
  )
}

export default function TreeView () {
  const dispatch = useDispatch()
  const tree = useSelector(s => s.model.tree)
  const selected = useSelector(s => s.model.selectedNodeId)
  if (!tree) return <div style={{ padding: 10, color: '#9aa3b2' }}>Open a model to view its structure</div>
  return (
    <ul className='tree'>
      <Node node={tree} selectedId={selected} onSelect={(id) => dispatch(selectNode({ nodeId: id }))} />
    </ul>
  )
}
