import React, { useEffect, useRef, useState } from 'react'

function YouTubePlayer({ videoId, isPlaying, onReady, onStateChange }) {
  const playerRef = useRef(null)
  const containerRef = useRef(null)
  const [playerReady, setPlayerReady] = useState(false)
  const [isAPIReady, setIsAPIReady] = useState(false)

  useEffect(() => {
    if (!window.YT) {
      const script = document.createElement('script')
      script.src = 'https://www.youtube.com/iframe_api'
      script.async = true
      document.body.appendChild(script)

      window.onYouTubeIframeAPIReady = () => {
        console.log('YouTube API Ready')
        setIsAPIReady(true)
      }
    } else {
      setIsAPIReady(true)
    }

    return () => {
      if (playerRef.current && playerRef.current.destroy) {
        try {
          playerRef.current.destroy()
        } catch (e) {
          console.log('Player destroy error:', e)
        }
      }
    }
  }, [])

  useEffect(() => {
    if (isAPIReady && videoId && containerRef.current) {
      initializePlayer()
    }
  }, [isAPIReady, videoId])

  useEffect(() => {
    if (playerReady && playerRef.current) {
      try {
        if (isPlaying) {
          console.log('YouTube: Playing video')
          playerRef.current.playVideo()
        } else {
          console.log('YouTube: Pausing video')
          playerRef.current.pauseVideo()
        }
      } catch (e) {
        console.error('YouTube control error:', e)
      }
    }
  }, [isPlaying, playerReady])

  const initializePlayer = () => {
    if (containerRef.current && window.YT && window.YT.Player) {
      try {
        playerRef.current = new window.YT.Player(containerRef.current, {
          width: '100%',
          height: '100%',
          videoId: videoId,
          playerVars: {
            autoplay: 0,
            controls: 1,
            showinfo: 0,
            rel: 0,
            fs: 1,
            modestbranding: 1,
            enablejsapi: 1,
            origin: window.location.origin,
            mute: 1
          },
          events: {
            onReady: (event) => {
              console.log('YouTube Player Ready for:', videoId)
              setPlayerReady(true)
              if (onReady) onReady(event)
            },
            onStateChange: (event) => {
              console.log('YouTube Player State Change:', event.data)
              // -1: unstarted, 0: ended, 1: playing, 2: paused, 3: buffering, 5: video cued
              if (onStateChange) onStateChange(event)
            },
            onError: (event) => {
              console.error('YouTube Player Error:', event.data)
            }
          }
        })
      } catch (e) {
        console.error('Failed to initialize YouTube player:', e)
      }
    }
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div 
        ref={containerRef}
        style={{ width: '100%', height: '100%' }}
      />
      {!playerReady && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#fff',
          fontSize: '16px'
        }}>
          YouTube動画を読み込み中...
        </div>
      )}
    </div>
  )
}

export default YouTubePlayer