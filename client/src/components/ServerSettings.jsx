import React, { useState, useEffect } from 'react'

function ServerSettings({ onConnect, isConnected }) {
  const [serverUrl, setServerUrl] = useState('')
  const [isConfigured, setIsConfigured] = useState(false)

  useEffect(() => {
    // 保存されたサーバーURLを読み込み
    const savedUrl = localStorage.getItem('panel-talk-server-url')
    if (savedUrl) {
      setServerUrl(savedUrl)
      setIsConfigured(true)
      onConnect(savedUrl)
    }
  }, [])

  const handleConnect = () => {
    if (!serverUrl) return
    
    // スペースを除去してURLを正規化
    const cleanUrl = serverUrl.trim()
    const normalizedUrl = cleanUrl.startsWith('http') 
      ? cleanUrl 
      : `http://${cleanUrl}`
    
    // ポート番号がない場合は3001を追加
    const finalUrl = normalizedUrl.includes(':3001') 
      ? normalizedUrl 
      : `${normalizedUrl}:3001`
    
    localStorage.setItem('panel-talk-server-url', finalUrl)
    setIsConfigured(true)
    onConnect(finalUrl)
  }

  const handleDisconnect = () => {
    localStorage.removeItem('panel-talk-server-url')
    setIsConfigured(false)
    setServerUrl('')
    onConnect(null)
  }

  const handleUrlChange = (e) => {
    setServerUrl(e.target.value)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleConnect()
    }
  }

  if (isConfigured) {
    return (
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3>サーバー接続</h3>
            <p className="text-sm" style={{ color: '#ccc' }}>
              接続先: {localStorage.getItem('panel-talk-server-url')}
            </p>
          </div>
          <div className="flex" style={{ gap: '12px', alignItems: 'center' }}>
            <div className={`status-indicator ${isConnected ? 'status-connected' : 'status-disconnected'}`}>
              {isConnected ? '接続済み' : '未接続'}
            </div>
            <button onClick={handleDisconnect} className="reset-button">
              🔧 設定変更
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card" style={{ marginBottom: '20px' }}>
      <h3>サーバー設定</h3>
      <p className="text-sm" style={{ marginBottom: '16px', color: '#ccc' }}>
        パネルトークサーバーのアドレスを入力してください
      </p>
      
      <div className="flex-col" style={{ gap: '12px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
            サーバーアドレス
          </label>
          <input
            type="text"
            value={serverUrl}
            onChange={handleUrlChange}
            onKeyPress={handleKeyPress}
            placeholder="例: 192.168.1.100 または example.com"
            style={{ width: '100%' }}
          />
          <p className="text-sm" style={{ marginTop: '4px', opacity: 0.7 }}>
            IP アドレスまたはドメイン名（ポート3001が自動追加されます）
          </p>
        </div>
        
        <div className="flex" style={{ gap: '12px' }}>
          <button 
            onClick={handleConnect}
            disabled={!serverUrl}
            className="play-button"
          >
            🔗 接続
          </button>
          <button 
            onClick={() => setServerUrl('localhost')}
            className="reset-button"
          >
            📱 ローカル
          </button>
        </div>
      </div>
      
      <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>
        <p className="text-sm" style={{ fontWeight: 'bold', marginBottom: '8px' }}>💡 使用例:</p>
        <ul className="text-sm" style={{ paddingLeft: '16px', opacity: 0.8 }}>
          <li>ローカル: <code>localhost</code></li>
          <li>同じWiFi: <code>192.168.1.100</code></li>
          <li>ngrok: <code>abc123.ngrok.io</code></li>
          <li>カスタムドメイン: <code>your-domain.com</code></li>
        </ul>
      </div>
    </div>
  )
}

export default ServerSettings