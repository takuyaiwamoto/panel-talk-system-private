const { app, BrowserWindow, screen } = require('electron')
const path = require('path')

let mainWindow

function createWindow() {
  // プライマリディスプレイの情報を取得
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width, height } = primaryDisplay.workAreaSize

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    fullscreen: false,
    frame: true,
    backgroundColor: '#000000',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: false, // 自動再生のため
      allowRunningInsecureContent: true,
      experimentalFeatures: true,
      autoplayPolicy: 'no-user-gesture-required' // 自動再生許可
    },
    show: false
  })

  // 開発モードかどうか確認
  const isDev = process.argv.includes('--dev')
  
  if (isDev) {
    mainWindow.loadFile('index.html')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile('index.html')
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  // ウィンドウが閉じられたときの処理
  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // ESCキーでフルスクリーン解除を無効化
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'Escape') {
      event.preventDefault()
    }
  })
}

// アプリケーションの準備完了時
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// すべてのウィンドウが閉じられたときの処理
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// セキュリティ: 新しいウィンドウを開こうとする試みを無効化
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault()
  })
})