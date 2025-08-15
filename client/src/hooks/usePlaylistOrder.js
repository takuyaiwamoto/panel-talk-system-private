import { useState, useEffect } from 'react'

const STORAGE_KEY = 'panel-talk-playlist-order'

export function usePlaylistOrder(originalPlaylist) {
  const [orderedPlaylist, setOrderedPlaylist] = useState([])

  // 保存された順番を読み込み
  const loadSavedOrder = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const savedOrder = JSON.parse(saved)
        return savedOrder
      }
    } catch (error) {
      console.error('Failed to load saved playlist order:', error)
    }
    return null
  }

  // 順番を保存
  const saveOrder = (playlist) => {
    try {
      const orderData = playlist.map(item => item.id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orderData))
      console.log('Playlist order saved:', orderData)
    } catch (error) {
      console.error('Failed to save playlist order:', error)
    }
  }

  // プレイリストの順番を適用
  const applyOrder = (playlist, savedOrder) => {
    if (!savedOrder || savedOrder.length === 0) {
      return playlist
    }

    const orderedItems = []
    const remainingItems = [...playlist]

    // 保存された順番に従って並び替え
    savedOrder.forEach(id => {
      const item = remainingItems.find(item => item.id === id)
      if (item) {
        orderedItems.push(item)
        const index = remainingItems.indexOf(item)
        remainingItems.splice(index, 1)
      }
    })

    // 新しく追加されたアイテムは最後に追加
    return [...orderedItems, ...remainingItems]
  }

  // プレイリストが変更されたときの処理
  useEffect(() => {
    if (originalPlaylist && originalPlaylist.length > 0) {
      const savedOrder = loadSavedOrder()
      const ordered = applyOrder(originalPlaylist, savedOrder)
      setOrderedPlaylist(ordered)
    }
  }, [originalPlaylist])

  // アイテムの順番を変更
  const reorderItems = (startIndex, endIndex) => {
    const result = Array.from(orderedPlaylist)
    const [removed] = result.splice(startIndex, 1)
    result.splice(endIndex, 0, removed)

    setOrderedPlaylist(result)
    saveOrder(result)
    
    return result
  }

  // 順番をリセット
  const resetOrder = () => {
    localStorage.removeItem(STORAGE_KEY)
    setOrderedPlaylist(originalPlaylist || [])
  }

  return {
    orderedPlaylist,
    reorderItems,
    resetOrder,
    saveOrder: () => saveOrder(orderedPlaylist)
  }
}