# 学会パネルトークシステム

学会のパネルトーク向けブラウザベースシステムです。操作画面と表示画面が分離され、Socket.IOによるリアルタイム同期を実現しています。

## 🎯 機能

- **操作画面** - 司会・登壇者がアセットを切り替え、動画/YouTubeの再生・停止を制御
- **表示画面（Electron）** - 会場投影用のフルスクリーンアプリ（自動再生対応）
- **リアルタイム同期** - Socket.IOによる低遅延同期（100-300ms）
- **マルチメディア対応** - 画像（JPG/PNG）、動画（MP4）、YouTube動画
- **プレイリスト管理** - 事前設定されたアセットの順次切り替え
- **ダークテーマ** - 会場に適した暗いUI
- **自動再生対応** - Electronアプリで制限なし動画再生

## 🏗️ アーキテクチャ

```
panel-talk-system/
├── server/           # Node.js + Express + Socket.IO
├── client/           # React + Vite (操作画面)
├── display-app/      # Electron (表示画面)
├── data/            # assets.json (アセット定義)
├── assets/          # 画像・動画ファイル
└── package.json     # ルート設定
```

## 🚀 セットアップ

### 1. 依存関係のインストール

```bash
cd panel-talk-system
npm run install-all
```

### 2. アセットの配置

`/assets` ディレクトリに以下のファイルを配置：

```
assets/
├── opening.jpg           # オープニングスライド
├── opening_thumb.jpg     # サムネイル
├── qa.png               # 質疑応答画像  
├── qa_thumb.png         # サムネイル
├── closing.jpg          # クロージングスライド
├── closing_thumb.jpg    # サムネイル
├── intro.mp4            # 紹介動画
├── intro_thumb.jpg      # サムネイル
├── discussion.mp4       # 議論動画
├── discussion_thumb.jpg # サムネイル
└── youtube_thumb.jpg    # YouTubeサムネイル
```

### 3. アセット設定

`/data/assets.json` でアセットを定義：

```json
{
  "playlist": [
    {
      "id": "img-001",
      "type": "image",
      "title": "オープニングスライド",
      "filename": "opening.jpg",
      "thumbnail": "opening_thumb.jpg",
      "description": "パネルディスカッション開始"
    },
    {
      "id": "youtube-001", 
      "type": "youtube",
      "title": "基調講演",
      "videoId": "jNQXAC9IVRw",
      "thumbnail": "youtube_thumb.jpg",
      "description": "基調講演ハイライト",
      "duration": 180
    }
  ]
}
```

## 🎮 起動方法

### 🔥 推奨：完全起動（サーバー + 操作画面 + 表示アプリ）

```bash
npm run dev-full
```

### 個別起動

```bash
# 1. サーバー起動
npm run server

# 2. 操作画面起動  
npm run client

# 3. 表示アプリ起動（Electron）
npm run display
```

## 🌐 使用方法

### アクセスURL

- **操作画面**: http://localhost:3000/controller
- **表示アプリ**: 自動でフルスクリーン起動

### 操作手順

1. **システム起動**
   ```bash
   npm run dev-full
   ```

2. **表示アプリ確認**
   - Electronアプリが自動でフルスクリーン起動
   - 接続状態が「接続済み」になることを確認

3. **操作画面を開く**
   - 各操作者のPC・スマートフォンで http://localhost:3000/controller にアクセス

4. **アセット操作**
   - プレイリストからアセットをクリックして切り替え
   - 動画/YouTubeは再生・一時停止ボタンで制御
   - **自動再生制限なし！** - Electronアプリなのでユーザー操作不要

## 🛠️ 技術仕様

### フロントエンド
- **React 18** - 操作画面UIライブラリ
- **Vite** - ビルドツール
- **Electron** - 表示アプリ（デスクトップアプリ）
- **Socket.IO Client** - リアルタイム通信

### バックエンド  
- **Node.js** - サーバーランタイム
- **Express** - Webフレームワーク
- **Socket.IO** - WebSocketサーバー

### Electron設定
- **自動再生許可**: `autoplayPolicy: 'no-user-gesture-required'`
- **フルスクリーン**: 自動フルスクリーン + ESCキー無効化
- **カーソル非表示**: プレゼンテーション用
- **セキュリティ**: 新規ウィンドウ無効化

### 通信プロトコル

#### REST API
- `GET /api/assets` - アセット一覧取得
- `GET /api/playlist` - プレイリスト取得  
- `GET /api/current-state` - 現在状態取得

#### Socket.IO Events
- `controller:set-current` - アセット切り替え
- `controller:play` - 再生開始
- `controller:pause` - 一時停止
- `server:state` - 状態ブロードキャスト
- `display:ready` - 表示画面準備完了

## 📱 対応環境

- **表示PC**: macOS（Electronアプリ）
- **操作デバイス**: PC・スマートフォン（LAN経由）
- **ブラウザ**: Chrome, Safari, Firefox（操作画面）
- **同時操作者**: 3-4人

## 🎨 カスタマイズ

### アセットの追加
1. `/assets` にファイル配置
2. `/data/assets.json` に設定追加
3. サーバー再起動

### Electron設定変更
`/display-app/main.js` でウィンドウ・表示設定調整

### API拡張
`/server/index.js` でエンドポイント・Socket.IOイベント追加

## ✅ Electronアプリの利点

- **🎬 自動再生制限なし**: ユーザー操作不要で動画・YouTube自動再生
- **⚡ 高性能**: ネイティブアプリなので安定動作
- **🔒 フルスクリーン固定**: ESCキー無効化、プレゼンに最適
- **🖱️ カーソル非表示**: 会場投影時の邪魔な要素除去
- **📺 マルチディスプレイ対応**: プライマリディスプレイで自動起動

## 🔧 トラブルシューティング

### Electronアプリが起動しない
```bash
cd display-app
npm install electron --save-dev
npm start
```

### アセットが表示されない
- ファイルパスを確認
- サーバーが http://localhost:3001 で起動しているか確認

### Socket接続エラー  
- サーバーが起動しているか確認
- ポート3001が使用可能か確認

### YouTube再生不可
- videoIdが正しいか確認
- インターネット接続を確認

## 📄 ライセンス

MIT License

## 🚀 本番運用

```bash
# 1. システム起動
npm run dev-full

# 2. 表示PCでElectronアプリ確認
# 3. 操作者は http://localhost:3000/controller にアクセス  
# 4. 完全自動再生対応でプレゼンテーション開始！
```