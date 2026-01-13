'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/utils/cn'
import {
  Plus,
  Minus,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize,
  Edit2,
  Trash2,
  Link,
  X,
  Check,
  Loader2,
} from 'lucide-react'
import { useMindMapNodes, MindMapNode } from '@/lib/hooks/useProjectManager'

// Re-export the interface for external use
export type { MindMapNode }

interface MindMapProps {
  onNodesChange?: (nodes: MindMapNode[]) => void
}

export function MindMap({ onNodesChange }: MindMapProps) {
  const { nodes, loading, error, createNode, updateNode, deleteNode } = useMindMapNodes()
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [editingNode, setEditingNode] = useState<string | null>(null)
  const [editLabel, setEditLabel] = useState('')
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [draggedNode, setDraggedNode] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const dragStartPos = useRef<{ x: number; y: number } | null>(null)

  // Handle node drag
  const handleNodeMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation()
    setDraggedNode(nodeId)
    setSelectedNode(nodeId)
    const node = nodes.find(n => n.id === nodeId)
    if (node) {
      dragStartPos.current = { x: node.x, y: node.y }
    }
  }, [nodes])

  // Notify parent of changes
  useEffect(() => {
    if (onNodesChange && nodes.length > 0) {
      onNodesChange(nodes)
    }
  }, [nodes, onNodesChange])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (draggedNode && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const x = (e.clientX - rect.left - pan.x) / zoom
        const y = (e.clientY - rect.top - pan.y) / zoom

        // Optimistic local update for smooth dragging
        // The actual node state is managed by the hook
      }
    }

    const handleMouseUp = async () => {
      if (draggedNode && containerRef.current && dragStartPos.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const node = nodes.find(n => n.id === draggedNode)

        // Only save if position actually changed
        if (node && (node.x !== dragStartPos.current.x || node.y !== dragStartPos.current.y)) {
          try {
            setIsSaving(true)
            await updateNode(draggedNode, { x: node.x, y: node.y })
          } catch (err) {
            console.error('Failed to save node position:', err)
          } finally {
            setIsSaving(false)
          }
        }
      }
      setDraggedNode(null)
      dragStartPos.current = null
    }

    if (draggedNode) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [draggedNode, pan, zoom, nodes, updateNode])

  // Handle real-time position updates during drag
  useEffect(() => {
    if (!draggedNode) return

    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const x = (e.clientX - rect.left - pan.x) / zoom
        const y = (e.clientY - rect.top - pan.y) / zoom

        // Update node position via hook (optimistic update)
        updateNode(draggedNode, { x, y }).catch(() => {
          // Errors are handled by the hook
        })
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [draggedNode, pan, zoom, updateNode])

  // Draw connections between nodes
  const renderConnections = () => {
    const connections: JSX.Element[] = []

    nodes.forEach(node => {
      node.children?.forEach(childId => {
        const child = nodes.find(n => n.id === childId)
        if (child) {
          connections.push(
            <line
              key={`${node.id}-${childId}`}
              x1={node.x}
              y1={node.y}
              x2={child.x}
              y2={child.y}
              stroke={`${node.color}40`}
              strokeWidth={2}
              strokeDasharray={child.status === 'blocked' ? '5,5' : undefined}
            />
          )
        }
      })
    })

    return connections
  }

  const handleAddChild = async (parentId: string) => {
    const parent = nodes.find(n => n.id === parentId)
    if (!parent) return

    try {
      setIsSaving(true)
      const newNode = await createNode({
        label: 'New Node',
        x: parent.x + 100,
        y: parent.y + 80,
        color: parent.color,
        children: [],
        expanded: false,
        status: 'planned',
        parent_id: parentId,
      })

      // Update parent's children array
      await updateNode(parentId, {
        children: [...(parent.children || []), newNode.id],
      })

      setEditingNode(newNode.id)
      setEditLabel('New Node')
    } catch (err) {
      console.error('Failed to add child node:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteNode = async (nodeId: string) => {
    // Find root node by checking for node with no parent or labeled 'HMN'
    const rootNode = nodes.find(n => n.parent_id === null || n.label === 'HMN')
    if (rootNode && nodeId === rootNode.id) return // Can't delete root

    try {
      setIsSaving(true)

      // Get the node being deleted
      const nodeToDelete = nodes.find(n => n.id === nodeId)

      // Update parent's children array if parent exists
      if (nodeToDelete?.parent_id) {
        const parent = nodes.find(n => n.id === nodeToDelete.parent_id)
        if (parent) {
          await updateNode(parent.id, {
            children: (parent.children || []).filter(c => c !== nodeId),
          })
        }
      }

      await deleteNode(nodeId)
      setSelectedNode(null)
    } catch (err) {
      console.error('Failed to delete node:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveEdit = async () => {
    if (editingNode && editLabel.trim()) {
      try {
        setIsSaving(true)
        await updateNode(editingNode, { label: editLabel.trim() })
      } catch (err) {
        console.error('Failed to save label:', err)
      } finally {
        setIsSaving(false)
      }
    }
    setEditingNode(null)
    setEditLabel('')
  }

  const statusColors = {
    active: 'ring-2 ring-green-400',
    blocked: 'ring-2 ring-red-400 opacity-60',
    done: 'ring-2 ring-blue-400',
    planned: 'ring-2 ring-slate-400',
  }

  // Find root node for delete protection
  const rootNode = nodes.find(n => n.parent_id === null || n.label === 'HMN')

  if (loading && nodes.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-4" />
        <p className="text-slate-400">Loading mind map...</p>
      </div>
    )
  }

  if (error && nodes.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <p className="text-red-400 mb-2">Failed to load mind map</p>
        <p className="text-slate-500 text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            Mind Map
            {isSaving && <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />}
          </h2>
          <p className="text-sm text-slate-400">Visualize your project architecture</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <ZoomOut size={18} />
          </button>
          <span className="text-sm text-slate-400 w-16 text-center">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom(z => Math.min(2, z + 0.1))}
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <ZoomIn size={18} />
          </button>
          <button
            onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }) }}
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="flex-1 bg-slate-900/50 rounded-xl border border-slate-700/50 overflow-hidden relative"
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <svg
          ref={svgRef}
          className="w-full h-full"
          style={{
            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
            transformOrigin: 'center center',
          }}
        >
          {/* Connections */}
          {renderConnections()}
        </svg>

        {/* Nodes */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
            transformOrigin: 'center center',
          }}
        >
          {nodes.map(node => (
            <motion.div
              key={node.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={cn(
                'absolute pointer-events-auto cursor-move',
                'px-4 py-2 rounded-lg text-white text-sm font-medium',
                'shadow-lg transition-all',
                selectedNode === node.id && 'ring-2 ring-white ring-offset-2 ring-offset-slate-900',
                node.status && statusColors[node.status],
              )}
              style={{
                left: node.x - 50,
                top: node.y - 20,
                backgroundColor: node.color,
                transform: 'translate(-50%, -50%)',
              }}
              onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
              onDoubleClick={() => {
                setEditingNode(node.id)
                setEditLabel(node.label)
              }}
            >
              {editingNode === node.id ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    className="bg-black/30 border-none rounded px-1 py-0.5 text-white text-sm w-24 focus:outline-none"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit()
                      if (e.key === 'Escape') setEditingNode(null)
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button onClick={handleSaveEdit} className="p-0.5 hover:bg-black/20 rounded">
                    <Check size={12} />
                  </button>
                </div>
              ) : (
                <span>{node.label}</span>
              )}
            </motion.div>
          ))}
        </div>

        {/* Selected Node Actions */}
        <AnimatePresence>
          {selectedNode && !editingNode && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-800 rounded-lg p-2 border border-slate-700"
            >
              <button
                onClick={() => handleAddChild(selectedNode)}
                disabled={isSaving}
                className="flex items-center gap-1 px-3 py-1.5 rounded bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 text-sm disabled:opacity-50"
              >
                <Plus size={14} /> Add Child
              </button>
              <button
                onClick={() => {
                  setEditingNode(selectedNode)
                  setEditLabel(nodes.find(n => n.id === selectedNode)?.label || '')
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded bg-slate-700 text-slate-300 hover:bg-slate-600 text-sm"
              >
                <Edit2 size={14} /> Edit
              </button>
              {rootNode && selectedNode !== rootNode.id && (
                <button
                  onClick={() => handleDeleteNode(selectedNode)}
                  disabled={isSaving}
                  className="flex items-center gap-1 px-3 py-1.5 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 text-sm disabled:opacity-50"
                >
                  <Trash2 size={14} /> Delete
                </button>
              )}
              <button
                onClick={() => setSelectedNode(null)}
                className="p-1.5 rounded text-slate-400 hover:bg-slate-700"
              >
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-400" /> Active
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-400" /> Done
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-slate-400" /> Planned
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-400" /> Blocked
        </span>
        {error && (
          <span className="text-red-400 ml-auto">Sync error: {error}</span>
        )}
      </div>
    </div>
  )
}
