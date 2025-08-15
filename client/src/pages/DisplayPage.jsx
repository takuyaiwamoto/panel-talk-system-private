import React, { useEffect, useRef, useState } from 'react'
import { useSocket } from '../hooks/useSocket'
import { useAssets } from '../hooks/useAssets'
import YouTubePlayer from '../components/YouTubePlayer'

function DisplayPage() {
  const { currentState } = useSocket()
  const { getAssetById, getAssetUrl } = useAssets()
  const videoRef = useRef(null)
  const youtubeRef = useRef(null)
  const [userInteracted, setUserInteracted] = useState(false)

  const currentAsset = currentState.currentAssetId ? getAssetById(currentState.currentAssetId) : null

  const handleUserInteraction = () => {
    setUserInteracted(true)
    console.log('ユーザー操作により自動再生が有効になりました')
  }

  useEffect(() => {
    const socket = window.io?.('http://localhost:3001')
    if (socket) {
      socket.emit('display:ready')
      return () => socket.close()
    }
  }, [])

  useEffect(() => {
    if (currentAsset && currentAsset.type === 'video' && videoRef.current) {
      if (currentState.isPlaying) {
        videoRef.current.play()
      } else {
        videoRef.current.pause()
      }
    }
  }, [currentState.isPlaying, currentAsset])

  const renderContent = () => {
    if (!userInteracted) {
      return (
        <div 
          onClick={handleUserInteraction}
          style={{ 
            cursor: 'pointer',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            gap: '20px'
          }}
        >
          <p style={{ color: '#fff', fontSize: '28px', fontWeight: 'bold' }}>
            🎬 表示画面
          </p>
          <p style={{ color: '#ccc', fontSize: '18px' }}>
            クリックして自動再生を有効にしてください
          </p>
          <p style={{ color: '#999', fontSize: '14px' }}>
            (この操作により、動画・YouTube動画の自動再生が可能になります)
          </p>
        </div>
      )
    }

    if (!currentAsset) {
      return (
        <p style={{ color: '#666', fontSize: '24px', textAlign: 'center' }}>
          アセットが選択されていません
        </p>
      )
    }

    switch (currentAsset.type) {
      case 'image':
        return (
          <img
            src={getAssetUrl(currentAsset)}
            alt={currentAsset.title}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain'
            }}
          />
        )
      
      case 'video':
        return (
          <video
            ref={videoRef}
            src={getAssetUrl(currentAsset)}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain'
            }}
            controls={false}
            muted={false}
          />
        )
      
      case 'youtube':
        return (
          <div style={{ 
            width: '80vw', 
            height: '45vw',
            maxHeight: '80vh',
            maxWidth: '100vw'
          }}>
            <YouTubePlayer
              videoId={currentAsset.videoId}
              isPlaying={currentState.isPlaying}
              onReady={(event) => {
                console.log('YouTube player ready for:', currentAsset.title)
              }}
              onStateChange={(event) => {
                console.log('YouTube state change:', event.data)
              }}
            />
          </div>
        )
      
      default:
        return (
          <p style={{ color: '#ff6b6b', fontSize: '24px', textAlign: 'center' }}>
            サポートされていないアセットタイプ: {currentAsset.type}
          </p>
        )
    }
  }

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100vw', 
      height: '100vh',
      background: '#000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden'
    }}>
      {renderContent()}
    </div>
  )
}

export default DisplayPage