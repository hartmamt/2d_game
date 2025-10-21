const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

// Game state
const rooms = new Map();
const MAX_PLAYERS_PER_ROOM = 4;

class GameRoom {
  constructor(id) {
    this.id = id;
    this.players = new Map();
    this.enemies = new Map();
    this.bosses = new Map();
    this.items = new Map();
    this.currentZone = 1;
    this.timelineLoops = 0;
    this.difficultyMultiplier = 1.0;
    this.lastUpdate = Date.now();
  }

  addPlayer(socketId, playerData) {
    this.players.set(socketId, {
      id: socketId,
      ...playerData,
      x: 400 + Math.random() * 200,
      y: 300 + Math.random() * 200,
      health: playerData.maxHealth,
      score: 0,
      items: []
    });
  }

  removePlayer(socketId) {
    this.players.delete(socketId);
  }

  update() {
    const now = Date.now();
    const deltaTime = (now - this.lastUpdate) / 1000;
    this.lastUpdate = now;

    // Update game logic here
    return {
      players: Array.from(this.players.values()),
      enemies: Array.from(this.enemies.values()),
      bosses: Array.from(this.bosses.values()),
      items: Array.from(this.items.values()),
      zone: this.currentZone,
      timelineLoops: this.timelineLoops
    };
  }
}

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  socket.on('joinGame', (data) => {
    const { playerName, characterClass, roomId } = data;

    let room = rooms.get(roomId || 'default');
    if (!room) {
      room = new GameRoom(roomId || 'default');
      rooms.set(room.id, room);
    }

    if (room.players.size >= MAX_PLAYERS_PER_ROOM) {
      socket.emit('roomFull');
      return;
    }

    // Character stats
    const characterStats = {
      scavenger: { maxHealth: 100, speed: 200, damage: 15, attackSpeed: 0.2 },
      forgeguard: { maxHealth: 200, speed: 100, damage: 40, attackSpeed: 0.8 },
      riftrunner: { maxHealth: 75, speed: 250, damage: 25, attackSpeed: 0.3 }
    };

    const stats = characterStats[characterClass] || characterStats.scavenger;

    room.addPlayer(socket.id, {
      name: playerName,
      class: characterClass,
      ...stats
    });

    socket.join(room.id);
    socket.roomId = room.id;

    socket.emit('gameJoined', {
      playerId: socket.id,
      room: room.id
    });

    io.to(room.id).emit('gameState', room.update());
  });

  socket.on('playerMove', (data) => {
    if (!socket.roomId) return;
    const room = rooms.get(socket.roomId);
    if (!room) return;

    const player = room.players.get(socket.id);
    if (player) {
      player.x = data.x;
      player.y = data.y;
      player.rotation = data.rotation;

      io.to(socket.roomId).emit('playerMoved', {
        id: socket.id,
        x: data.x,
        y: data.y,
        rotation: data.rotation
      });
    }
  });

  socket.on('playerShoot', (data) => {
    if (!socket.roomId) return;
    io.to(socket.roomId).emit('playerShot', {
      id: socket.id,
      ...data
    });
  });

  socket.on('playerDamage', (data) => {
    if (!socket.roomId) return;
    const room = rooms.get(socket.roomId);
    if (!room) return;

    const player = room.players.get(socket.id);
    if (player) {
      player.health = Math.max(0, player.health - data.damage);

      io.to(socket.roomId).emit('playerHealthUpdate', {
        id: socket.id,
        health: player.health
      });

      if (player.health <= 0) {
        io.to(socket.roomId).emit('playerDied', { id: socket.id });
      }
    }
  });

  socket.on('spawnEnemy', (data) => {
    if (!socket.roomId) return;
    const room = rooms.get(socket.roomId);
    if (!room) return;

    const enemyId = `enemy_${Date.now()}_${Math.random()}`;
    room.enemies.set(enemyId, {
      id: enemyId,
      ...data
    });

    io.to(socket.roomId).emit('enemySpawned', {
      id: enemyId,
      ...data
    });
  });

  socket.on('enemyKilled', (data) => {
    if (!socket.roomId) return;
    const room = rooms.get(socket.roomId);
    if (!room) return;

    room.enemies.delete(data.enemyId);
    io.to(socket.roomId).emit('enemyDestroyed', data);
  });

  socket.on('bossDefeated', (data) => {
    if (!socket.roomId) return;
    const room = rooms.get(socket.roomId);
    if (!room) return;

    io.to(socket.roomId).emit('bossKilled', data);
  });

  socket.on('teleporterActivated', (data) => {
    if (!socket.roomId) return;
    const room = rooms.get(socket.roomId);
    if (!room) return;

    room.currentZone++;
    io.to(socket.roomId).emit('zoneChanged', { zone: room.currentZone });
  });

  socket.on('augmentTimeline', () => {
    if (!socket.roomId) return;
    const room = rooms.get(socket.roomId);
    if (!room) return;

    room.timelineLoops++;
    room.currentZone = 1;
    room.difficultyMultiplier = 1 + (room.timelineLoops * 0.5);

    io.to(socket.roomId).emit('timelineAugmented', {
      loops: room.timelineLoops,
      multiplier: room.difficultyMultiplier
    });
  });

  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);

    if (socket.roomId) {
      const room = rooms.get(socket.roomId);
      if (room) {
        room.removePlayer(socket.id);
        io.to(socket.roomId).emit('playerLeft', { id: socket.id });

        if (room.players.size === 0) {
          rooms.delete(socket.roomId);
        }
      }
    }
  });
});

// Game loop
setInterval(() => {
  rooms.forEach((room) => {
    const state = room.update();
    io.to(room.id).emit('gameState', state);
  });
}, 1000 / 20); // 20 ticks per second

server.listen(PORT, () => {
  console.log(`Ashen Core server running on port ${PORT}`);
});
