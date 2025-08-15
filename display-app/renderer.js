class PanelTalkDisplay {
    constructor() {
        this.socket = null
        this.currentAsset = null
        this.currentState = { currentAssetId: null, isPlaying: false }
        this.youtubePlayer = null
        this.assets = null
        
        this.init()
    }

    async init() {
        try {
            // アセットデータを取得
            await this.loadAssets()
            
            // Socket.IO接続
            this.connectSocket()
            
            // YouTube API準備
            this.setupYouTubeAPI()
            
            console.log('Panel Talk Display initialized')
        } catch (error) {
            console.error('Initialization error:', error)
            this.showError('初期化エラー: ' + error.message)
        }
    }

    async loadAssets() {
        try {
            const response = await fetch('http://localhost:3001/api/assets')
            if (!response.ok) {
                throw new Error('アセットの読み込みに失敗しました')
            }
            this.assets = await response.json()
            console.log('Assets loaded:', this.assets)
        } catch (error) {
            console.error('Failed to load assets:', error)
            throw error
        }
    }

    connectSocket() {
        console.log('Attempting to connect to Socket.IO server...')
        this.socket = io('http://localhost:3001', {
            transports: ['websocket', 'polling'],
            timeout: 5000,
            forceNew: true
        })
        
        this.socket.on('connect', () => {
            console.log('Socket connected successfully!')
            this.updateStatus(true)
            this.socket.emit('display:ready')
        })
        
        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error)
            this.updateStatus(false)
        })
        
        this.socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason)
            this.updateStatus(false)
        })
        
        this.socket.on('reconnect', () => {
            console.log('Socket reconnected')
            this.updateStatus(true)
        })
        
        this.socket.on('server:state', (state) => {
            console.log('State update:', state)
            this.handleStateUpdate(state)
        })
        
        // 接続タイムアウト
        setTimeout(() => {
            if (!this.socket.connected) {
                console.error('Socket connection timeout')
                this.showError('サーバーに接続できません。サーバーが起動しているか確認してください。')
            }
        }, 10000)
    }

    updateStatus(connected) {
        const statusEl = document.getElementById('status')
        if (connected) {
            statusEl.textContent = '接続済み'
            statusEl.className = 'status-indicator status-connected'
        } else {
            statusEl.textContent = '未接続'
            statusEl.className = 'status-indicator status-disconnected'
        }
    }

    handleStateUpdate(state) {
        const prevState = { ...this.currentState }
        this.currentState = state
        
        // アセット変更時
        if (state.currentAssetId !== prevState.currentAssetId) {
            this.switchAsset(state.currentAssetId)
        }
        
        // 再生状態変更時
        if (state.currentAssetId && state.isPlaying !== prevState.isPlaying) {
            this.handlePlaybackControl(state.isPlaying)
        }
    }

    switchAsset(assetId) {
        if (!this.assets || !assetId) {
            this.showPlaceholder('アセットが選択されていません')
            return
        }
        
        const asset = this.assets.playlist.find(a => a.id === assetId)
        if (!asset) {
            this.showError('アセットが見つかりません: ' + assetId)
            return
        }
        
        this.currentAsset = asset
        console.log('Switching to asset:', asset)
        
        this.renderAsset(asset)
    }

    renderAsset(asset) {
        const contentEl = document.getElementById('content')
        
        switch (asset.type) {
            case 'image':
                this.renderImage(asset, contentEl)
                break
            case 'video':
                this.renderVideo(asset, contentEl)
                break
            case 'youtube':
                this.renderYouTube(asset, contentEl)
                break
            default:
                this.showError('サポートされていないタイプ: ' + asset.type)
        }
    }

    renderImage(asset, container) {
        const imageUrl = `http://localhost:3001/assets/${asset.filename}`
        container.innerHTML = `
            <div class="media-content">
                <img src="${imageUrl}" alt="${asset.title}" onload="console.log('Image loaded')" onerror="console.error('Image load error')">
            </div>
        `
    }

    renderVideo(asset, container) {
        const videoUrl = `http://localhost:3001/assets/${asset.filename}`
        container.innerHTML = `
            <div class="media-content">
                <video id="main-video" src="${videoUrl}" onloadeddata="console.log('Video loaded')" onerror="console.error('Video load error')">
                    お使いのブラウザは動画の再生をサポートしていません。
                </video>
            </div>
        `
    }

    renderYouTube(asset, container) {
        container.innerHTML = `
            <div class="youtube-container">
                <div id="youtube-player"></div>
            </div>
        `
        
        // YouTube Player作成
        this.createYouTubePlayer(asset.videoId)
    }

    setupYouTubeAPI() {
        window.onYouTubeIframeAPIReady = () => {
            console.log('YouTube API ready')
        }
    }

    createYouTubePlayer(videoId) {
        if (!window.YT || !window.YT.Player) {
            console.error('YouTube API not ready')
            return
        }
        
        // 既存のプレイヤーを破棄
        if (this.youtubePlayer) {
            try {
                this.youtubePlayer.destroy()
            } catch (e) {
                console.log('Error destroying previous player:', e)
            }
        }
        
        this.youtubePlayer = new YT.Player('youtube-player', {
            width: '100%',
            height: '100%',
            videoId: videoId,
            playerVars: {
                autoplay: 0,
                controls: 0,
                showinfo: 0,
                rel: 0,
                fs: 1,
                modestbranding: 1,
                enablejsapi: 1,
                mute: 0  // Electronでは音声ONで大丈夫
            },
            events: {
                onReady: (event) => {
                    console.log('YouTube Player ready for:', videoId)
                    // 現在の再生状態に合わせる
                    if (this.currentState.isPlaying) {
                        event.target.playVideo()
                    }
                },
                onStateChange: (event) => {
                    console.log('YouTube state change:', event.data)
                },
                onError: (event) => {
                    console.error('YouTube error:', event.data)
                    this.showError('YouTube動画の読み込みに失敗しました')
                }
            }
        })
    }

    handlePlaybackControl(isPlaying) {
        if (!this.currentAsset) return
        
        console.log('Playback control:', isPlaying ? 'play' : 'pause')
        
        if (this.currentAsset.type === 'video') {
            const video = document.getElementById('main-video')
            if (video) {
                try {
                    if (isPlaying) {
                        video.play()
                    } else {
                        video.pause()
                    }
                } catch (e) {
                    console.error('Video control error:', e)
                }
            }
        } else if (this.currentAsset.type === 'youtube' && this.youtubePlayer) {
            try {
                if (isPlaying) {
                    this.youtubePlayer.playVideo()
                } else {
                    this.youtubePlayer.pauseVideo()
                }
            } catch (e) {
                console.error('YouTube control error:', e)
            }
        }
    }

    showPlaceholder(message) {
        const contentEl = document.getElementById('content')
        contentEl.innerHTML = `
            <div class="placeholder">
                <p>${message}</p>
            </div>
        `
    }

    showError(message) {
        const contentEl = document.getElementById('content')
        contentEl.innerHTML = `
            <div class="error">
                <p>⚠️ ${message}</p>
            </div>
        `
    }
}

// アプリケーション起動
document.addEventListener('DOMContentLoaded', () => {
    window.displayApp = new PanelTalkDisplay()
})

// ショートカットキー
document.addEventListener('keydown', (event) => {
    // F11でフルスクリーン切り替え（開発用）
    if (event.key === 'F11') {
        event.preventDefault()
    }
    
    // Escapeキーを無効化
    if (event.key === 'Escape') {
        event.preventDefault()
    }
})