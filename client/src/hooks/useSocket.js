import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'

export function useSocket(serverUrl = null) {
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [currentState, setCurrentState] = useState({
    currentAssetId: null,
    isPlaying: false
  })

  useEffect(() => {
    if (!serverUrl) {
      // サーバーURLが設定されていない場合は接続しない
      setSocket(null)
      setIsConnected(false)
      return
    }

    console.log('Initializing Socket.IO connection to:', serverUrl)
    const socketInstance = io(serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 5000,
      forceNew: true
    })
    
    socketInstance.on('connect', () => {
      console.log('Socket接続成功')
      setIsConnected(true)
    })

    socketInstance.on('connect_error', (error) => {
      console.error('Socket接続エラー:', error)
      setIsConnected(false)
    })

    socketInstance.on('disconnect', (reason) => {
      console.log('Socket切断:', reason)
      setIsConnected(false)
    })

    socketInstance.on('reconnect', () => {
      console.log('Socket再接続')
      setIsConnected(true)
    })

    socketInstance.on('server:state', (state) => {
      console.log('状態更新:', state)
      setCurrentState(state)
    })

    setSocket(socketInstance)

    // 接続タイムアウト
    const timeout = setTimeout(() => {
      if (!socketInstance.connected) {
        console.error('Socket接続タイムアウト')
      }
    }, 10000)

    return () => {
      clearTimeout(timeout)
      socketInstance.close()
    }
  }, [serverUrl])

  const setCurrent = (assetId) => {
    if (socket) {
      socket.emit('controller:set-current', { id: assetId })
    }
  }

  const play = (assetId) => {
    if (socket) {
      socket.emit('controller:play', { id: assetId })
    }
  }

  const pause = (assetId) => {
    if (socket) {
      socket.emit('controller:pause', { id: assetId })
    }
  }

  return {
    socket,
    isConnected,
    currentState,
    setCurrent,
    play,
    pause
  }
}