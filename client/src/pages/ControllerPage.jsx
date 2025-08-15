import React, { useState } from 'react'
import { useSocket } from '../hooks/useSocket'
import { useAssets } from '../hooks/useAssets'
import { usePlaylistOrder } from '../hooks/usePlaylistOrder'
import DraggablePlaylistItem from '../components/DraggablePlaylistItem'
import ServerSettings from '../components/ServerSettings'

function ControllerPage() {
  const [serverUrl, setServerUrl] = useState(null)
  
  const { isConnected, currentState, setCurrent, play, pause } = useSocket(serverUrl)
  const { playlist, loading, error, getAssetById, getThumbnailUrl } = useAssets(serverUrl)
  const { orderedPlaylist, reorderItems, resetOrder } = usePlaylistOrder(playlist)
  
  const [dragState, setDragState] = useState({
    dragIndex: null,
    dragOverIndex: null
  })

  const currentAsset = currentState.currentAssetId ? getAssetById(currentState.currentAssetId) : null

  const handleServerConnect = (url) => {
    setServerUrl(url)
  }

  const handleAssetClick = (assetId) => {
    setCurrent(assetId)
  }

  const handlePlayPause = () => {
    if (!currentAsset) return
    
    if (currentState.isPlaying) {
      pause(currentAsset.id)
    } else {
      play(currentAsset.id)
    }
  }

  const handleDragStart = (index) => {
    setDragState({
      dragIndex: index,
      dragOverIndex: null
    })
  }

  const handleDragEnd = () => {
    const { dragIndex, dragOverIndex } = dragState
    
    if (dragIndex !== null && dragOverIndex !== null && dragIndex !== dragOverIndex) {
      reorderItems(dragIndex, dragOverIndex)
    }
    
    setDragState({
      dragIndex: null,
      dragOverIndex: null
    })
  }

  const handleDragOver = (index) => {
    setDragState(prev => ({
      ...prev,
      dragOverIndex: index
    }))
  }

  const handleDrop = (index) => {
    setDragState(prev => ({
      ...prev,
      dragOverIndex: index
    }))
  }

  const handleResetOrder = () => {
    if (confirm('プレイリストの順番を初期状態にリセットしますか？')) {
      resetOrder()
    }
  }

  if (loading) {
    return (
      <div className="container">
        <p>読み込み中...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container">
        <p style={{ color: '#ff6b6b' }}>エラー: {error}</p>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 className="text-lg">パネルトーク操作画面</h1>
        <div className="flex">
          <div className={`status-indicator ${isConnected ? 'status-connected' : 'status-disconnected'}`}>
            {isConnected ? '接続済み' : '未接続'}
          </div>
        </div>
      </div>

      <ServerSettings onConnect={handleServerConnect} isConnected={isConnected} />

      <div className="grid" style={{ gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
        <div className="card">
          <h2>現在表示中</h2>
          {currentAsset ? (
            <div className="flex-col">
              <img
                src={getThumbnailUrl(currentAsset)}
                alt={currentAsset.title}
                className="thumbnail"
                style={{ height: '200px' }}
              />
              <div>
                <h3>{currentAsset.title}</h3>
                <p className="text-sm">{currentAsset.description}</p>
                <p className="text-sm">タイプ: {currentAsset.type}</p>
              </div>
              {(currentAsset.type === 'video' || currentAsset.type === 'youtube') && (
                <div className="flex-col">
                  <button 
                    onClick={handlePlayPause}
                    className={currentState.isPlaying ? 'pause-button' : 'play-button'}
                  >
                    {currentState.isPlaying ? '⏸️ 一時停止' : '▶️ 再生'}
                  </button>
                  {currentAsset.type === 'youtube' && (
                    <p className="text-sm" style={{ color: '#ffc107', fontSize: '11px' }}>
                      ⚠️ YouTube動画: 表示画面で最初にクリックが必要です
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm">アセットが選択されていません</p>
          )}
        </div>

        <div className="card">
          <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2>プレイリスト</h2>
            <button 
              onClick={handleResetOrder}
              className="reset-button"
              title="順番をリセット"
            >
              🔄 順番リセット
            </button>
          </div>
          
          <div className="playlist-controls">
            <div className="order-info">
              💡 アイテムをドラッグして順番を変更できます
            </div>
          </div>

          <div className="playlist-grid">
            {orderedPlaylist.map((asset, index) => (
              <DraggablePlaylistItem
                key={asset.id}
                asset={asset}
                index={index}
                isActive={currentState.currentAssetId === asset.id}
                onClick={handleAssetClick}
                getThumbnailUrl={getThumbnailUrl}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                isDragging={dragState.dragIndex === index}
                dragOverIndex={dragState.dragOverIndex}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ControllerPage