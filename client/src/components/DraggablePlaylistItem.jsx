import React, { useState } from 'react'

function DraggablePlaylistItem({ 
  asset, 
  index, 
  isActive, 
  onClick, 
  getThumbnailUrl,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  isDragging,
  dragOverIndex
}) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragStart = (e) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', e.target.outerHTML)
    e.dataTransfer.setData('text/plain', asset.id)
    onDragStart(index)
  }

  const handleDragEnd = (e) => {
    onDragEnd()
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setIsDragOver(true)
    onDragOver(index)
  }

  const handleDragLeave = (e) => {
    setIsDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    onDrop(index)
  }

  const dragOverClass = dragOverIndex === index ? 'drag-over' : ''
  const draggingClass = isDragging ? 'dragging' : ''

  return (
    <div
      draggable
      className={`card asset-card clickable ${isActive ? 'active' : ''} ${dragOverClass} ${draggingClass}`}
      onClick={() => onClick(asset.id)}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        cursor: isDragging ? 'grabbing' : 'grab',
        opacity: isDragging ? 0.5 : 1,
        transform: isDragOver ? 'scale(1.02)' : 'scale(1)',
        transition: 'all 0.2s ease'
      }}
    >
      <div className="drag-handle" style={{
        position: 'absolute',
        top: '8px',
        right: '8px',
        background: 'rgba(255,255,255,0.2)',
        borderRadius: '4px',
        padding: '4px',
        fontSize: '12px',
        color: '#fff',
        cursor: 'grab'
      }}>
        ⋮⋮
      </div>
      
      <img
        src={getThumbnailUrl(asset)}
        alt={asset.title}
        className="thumbnail"
        draggable={false}
      />
      
      <div className="asset-info">
        <h4 className="asset-title">{asset.title}</h4>
        <p className="asset-type">{asset.type}</p>
        {asset.duration && (
          <p className="asset-duration">
            {Math.floor(asset.duration / 60)}:{(asset.duration % 60).toString().padStart(2, '0')}
          </p>
        )}
      </div>
    </div>
  )
}

export default DraggablePlaylistItem