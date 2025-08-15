import { useEffect, useState } from 'react'

export function useAssets() {
  const [assets, setAssets] = useState(null)
  const [playlist, setPlaylist] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await fetch('/api/assets')
        if (!response.ok) {
          throw new Error('アセットの読み込みに失敗しました')
        }
        const data = await response.json()
        setAssets(data)
        setPlaylist(data.playlist || [])
      } catch (err) {
        console.error('アセット取得エラー:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchAssets()
  }, [])

  const getAssetById = (id) => {
    return playlist.find(asset => asset.id === id)
  }

  const getThumbnailUrl = (asset) => {
    if (asset.type === 'youtube') {
      return asset.thumbnail ? `/assets/${asset.thumbnail}` : 
             `https://img.youtube.com/vi/${asset.videoId}/maxresdefault.jpg`
    }
    return asset.thumbnail ? `/assets/${asset.thumbnail}` : null
  }

  const getAssetUrl = (asset) => {
    if (asset.type === 'youtube') {
      return `https://www.youtube.com/embed/${asset.videoId}?enablejsapi=1`
    }
    return `/assets/${asset.filename}`
  }

  return {
    assets,
    playlist,
    loading,
    error,
    getAssetById,
    getThumbnailUrl,
    getAssetUrl
  }
}