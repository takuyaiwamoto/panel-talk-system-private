import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: true, // GitHub Pagesからのアクセスを許可
    methods: ["GET", "POST"],
    credentials: true
  },
  allowEIO3: true,
  transports: ['websocket', 'polling']
});

const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/assets', express.static(path.join(__dirname, '../assets')));

// 操作画面の静的ファイル配信
app.use(express.static(path.join(__dirname, '../client/dist')));

// SPAルーティング対応
app.get('*', (req, res) => {
  // APIやassetsでない場合は操作画面を返す
  if (!req.path.startsWith('/api') && !req.path.startsWith('/assets') && !req.path.startsWith('/socket.io')) {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  }
});

let currentState = {
  currentAssetId: null,
  isPlaying: false
};

app.get('/api/assets', (req, res) => {
  try {
    const assetsPath = path.join(__dirname, '../data/assets.json');
    const assetsData = JSON.parse(fs.readFileSync(assetsPath, 'utf8'));
    res.json(assetsData);
  } catch (error) {
    console.error('Error reading assets:', error);
    res.status(500).json({ error: 'Failed to load assets' });
  }
});

app.get('/api/playlist', (req, res) => {
  try {
    const assetsPath = path.join(__dirname, '../data/assets.json');
    const assetsData = JSON.parse(fs.readFileSync(assetsPath, 'utf8'));
    res.json(assetsData.playlist);
  } catch (error) {
    console.error('Error reading playlist:', error);
    res.status(500).json({ error: 'Failed to load playlist' });
  }
});

app.get('/api/current-state', (req, res) => {
  res.json(currentState);
});

io.on('connection', (socket) => {
  console.log('クライアント接続:', socket.id);

  socket.emit('server:state', currentState);

  socket.on('controller:set-current', (data) => {
    console.log('アセット切替:', data.id);
    currentState.currentAssetId = data.id;
    currentState.isPlaying = false;
    io.emit('server:state', currentState);
  });

  socket.on('controller:play', (data) => {
    console.log('再生開始:', data.id);
    currentState.isPlaying = true;
    io.emit('server:state', currentState);
  });

  socket.on('controller:pause', (data) => {
    console.log('一時停止:', data.id);
    currentState.isPlaying = false;
    io.emit('server:state', currentState);
  });

  socket.on('display:ready', () => {
    console.log('表示画面準備完了');
    socket.emit('server:state', currentState);
  });

  socket.on('disconnect', () => {
    console.log('クライアント切断:', socket.id);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`サーバー起動: http://localhost:${PORT}`);
  console.log(`外部アクセス: http://YOUR_IP_ADDRESS:${PORT}`);
});