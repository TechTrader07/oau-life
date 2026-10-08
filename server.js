import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  credentials: true
}));
app.use(express.json());
app.use(express.static('.'));

// ============ IN-MEMORY DATA STORAGE (Replace with DB later) ============
const players = new Map();
const messages = new Map();
const relationships = new Map();

// ============ GAME CONSTANTS ============
const LOCATIONS = [
  { id: 'oausu', name: 'OAUSU Building', x: 100, y: 100 },
  { id: 'sports', name: 'Sports Complex', x: 200, y: 150 },
  { id: 'amphitheater', name: 'Amphitheater', x: 300, y: 100 },
  { id: 'tech', name: 'Faculty of Tech', x: 400, y: 200 },
  { id: 'seaters', name: '1k seaters', x: 150, y: 250 },
  { id: 'pit', name: 'Pit theater', x: 250, y: 300 },
  { id: 'deho', name: 'As E De Hot', x: 350, y: 180 },
  { id: 'captain', name: 'Captain cook', x: 50, y: 200 },
  { id: 'awo', name: 'Awo Hall', x: 500, y: 100 },
  { id: 'law', name: 'Faculty of law', x: 450, y: 250 },
  { id: 'agic', name: 'Agic Extension', x: 200, y: 350 },
  { id: 'market', name: 'New market', x: 300, y: 320 },
  { id: 'angolo', name: 'Angolo Moz', x: 100, y: 400 }
];

const HOSTELS = ['AWO Hall', 'Moremi Hall', 'FAJ Hall', 'Angolo Moz', 'ETF Hall'];

const JOBS = [
  { id: 'captain_cook', name: 'Worker at captain cook', pay: 7500, duration: 12, location: 'captain' },
  { id: 'shuttle', name: 'School shuttle driver', pay: 10000, duration: 12, location: 'oausu' },
  { id: 'sub_bar', name: 'Worker at sub bar', pay: 5000, duration: 12, location: 'deho' },
  { id: 'remote', name: 'Remote jobs', pay: 25000, duration: 6, location: 'any' },
  { id: 'phone_tech', name: 'Phone technicians', pay: 7000, duration: 12, location: 'market' }
];

const LEVELS = [100, 200, 300, 400, 500];

// ============ HELPER FUNCTIONS ============

function generatePlayerId() {
  return 'player_' + Math.random().toString(36).substr(2, 9);
}

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function createNewPlayer(username, gender) {
  const playerId = generatePlayerId();
  const isNepoBaby = Math.random() > 0.5;
  
  const player = {
    id: playerId,
    username: username,
    gender: gender,
    cgpa: 5.0,
    level: 100,
    hostel: getRandomElement(HOSTELS),
    money: isNepoBaby ? 500000 : 20000,
    isNepoBaby: isNepoBaby,
    currentLocation: 'oausu',
    x: 100,
    y: 100,
    avatarColor: Math.floor(Math.random() * 16777215).toString(16),
    hair: ['black', 'brown', 'blonde', 'red'][Math.floor(Math.random() * 4)],
    skinTone: ['light', 'medium', 'dark'][Math.floor(Math.random() * 3)],
    relationships: [],
    classesAttended: 0,
    lastAttendedClass: null,
    currentGameTime: 8, // 8 AM
    createdAt: new Date(),
    socketId: null
  };

  players.set(playerId, player);
  return player;
}

function increaseGameTime(playerId, hours) {
  const player = players.get(playerId);
  if (player) {
    player.currentGameTime += hours;
    if (player.currentGameTime >= 24) {
      player.currentGameTime = 0; // Next day
    }
  }
}

function canAttendClass(player) {
  return player.currentGameTime >= 8 && player.currentGameTime < 16; // 8 AM - 4 PM
}

function attendClass(playerId) {
  const player = players.get(playerId);
  if (!player) return { success: false, message: 'Player not found' };
  
  if (!canAttendClass(player)) {
    return { success: false, message: `Classes only 8 AM - 4 PM. Current time: ${player.currentGameTime}:00` };
  }

  player.classesAttended++;
  player.lastAttendedClass = new Date();
  increaseGameTime(playerId, 2); // 2 hour class
  
  return { 
    success: true, 
    message: 'Attended class!',
    newTime: player.currentGameTime,
    classesAttended: player.classesAttended
  };
}

function workJob(playerId, jobId) {
  const player = players.get(playerId);
  const job = JOBS.find(j => j.id === jobId);
  
  if (!player) return { success: false, message: 'Player not found' };
  if (!job) return { success: false, message: 'Job not found' };

  player.money += job.pay;
  increaseGameTime(playerId, 1); // 1 hour of game time per work
  
  return { 
    success: true, 
    message: `Worked as ${job.name}! Earned ₦${job.pay}`,
    money: player.money,
    newTime: player.currentGameTime
  };
}

function sendMoney(fromId, toUsername, amount) {
  const fromPlayer = players.get(fromId);
  const toPlayer = Array.from(players.values()).find(p => p.username === toUsername);

  if (!fromPlayer) return { success: false, message: 'You not found' };
  if (!toPlayer) return { success: false, message: 'Recipient not found' };
  if (fromPlayer.money < amount) return { success: false, message: 'Insufficient balance' };

  fromPlayer.money -= amount;
  toPlayer.money += amount;

  return { 
    success: true, 
    message: `Sent ₦${amount} to ${toUsername}`,
    yourBalance: fromPlayer.money
  };
}

function sendMessage(fromId, toUsername, content) {
  const fromPlayer = players.get(fromId);
  const toPlayer = Array.from(players.values()).find(p => p.username === toUsername);

  if (!fromPlayer || !toPlayer) return { success: false };

  const messageId = 'msg_' + Date.now();
  const message = {
    id: messageId,
    from: fromPlayer.username,
    to: toPlayer.username,
    content: content,
    timestamp: new Date(),
    type: 'text'
  };

  if (!messages.has(toPlayer.id)) {
    messages.set(toPlayer.id, []);
  }
  messages.get(toPlayer.id).push(message);

  return { success: true, message };
}

// ============ REST ENDPOINTS ============

app.get('/api/health', (req, res) => {
  res.json({ status: 'OAU LIFE Server Running ✅' });
});

app.post('/api/register', (req, res) => {
  try {
    const { username, gender, googleId, googleName, googleEmail } = req.body;
    
    // Handle Google OAuth registration
    if (googleId) {
      const existingPlayer = Array.from(players.values()).find(p => p.email === googleEmail);
      if (existingPlayer) {
        return res.json({ 
          success: true, 
          player: {
            id: existingPlayer.id,
            username: existingPlayer.username,
            money: existingPlayer.money,
            cgpa: existingPlayer.cgpa,
            level: existingPlayer.level,
            hostel: existingPlayer.hostel,
            isNepoBaby: existingPlayer.isNepoBaby,
            email: existingPlayer.email
          }
        });
      }

      const player = createNewPlayer(googleName || googleEmail.split('@')[0], 'Other');
      player.googleId = googleId;
      player.email = googleEmail;
      player.avatar = `https://lh3.googleusercontent.com/a/default-user`;

      return res.json({ 
        success: true, 
        player: {
          id: player.id,
          username: player.username,
          money: player.money,
          cgpa: player.cgpa,
          level: player.level,
          hostel: player.hostel,
          isNepoBaby: player.isNepoBaby,
          email: player.email
        }
      });
    }

    // Handle regular registration
    if (!username || !gender) {
      return res.status(400).json({ error: 'Username and gender required' });
    }

    const existingPlayer = Array.from(players.values()).find(p => p.username === username);
    if (existingPlayer) {
      return res.status(400).json({ error: 'Username taken' });
    }

    const player = createNewPlayer(username, gender);
    res.json({ 
      success: true, 
      player: {
        id: player.id,
        username: player.username,
        money: player.money,
        cgpa: player.cgpa,
        level: player.level,
        hostel: player.hostel,
        isNepoBaby: player.isNepoBaby
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed: ' + error.message });
  }
});

app.get('/api/player/:playerId', (req, res) => {
  const player = players.get(req.params.playerId);
  if (!player) return res.status(404).json({ error: 'Player not found' });

  res.json({
    id: player.id,
    username: player.username,
    cgpa: player.cgpa,
    level: player.level,
    hostel: player.hostel,
    money: player.money,
    currentLocation: player.currentLocation,
    currentGameTime: player.currentGameTime,
    classesAttended: player.classesAttended,
    relationships: player.relationships,
    isNepoBaby: player.isNepoBaby
  });
});

app.get('/api/locations', (req, res) => {
  res.json(LOCATIONS);
});

app.get('/api/jobs', (req, res) => {
  res.json(JOBS);
});

app.get('/api/players', (req, res) => {
  const allPlayers = Array.from(players.values()).map(p => ({
    id: p.id,
    username: p.username,
    currentLocation: p.currentLocation,
    x: p.x,
    y: p.y,
    level: p.level,
    avatarColor: p.avatarColor,
    gender: p.gender
  }));
  res.json(allPlayers);
});

// ============ SOCKET.IO MULTIPLAYER ============

io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  socket.on('joinGame', (playerId) => {
    const player = players.get(playerId);
    if (player) {
      player.socketId = socket.id;
      socket.join('game_room');
      
      // Broadcast to all players
      io.emit('playerJoined', {
        playerId: player.id,
        username: player.username,
        location: player.currentLocation
      });

      socket.emit('gameState', {
        player: player,
        allPlayers: Array.from(players.values()).map(p => ({
          id: p.id,
          username: p.username,
          x: p.x,
          y: p.y,
          currentLocation: p.currentLocation
        }))
      });
    }
  });

  socket.on('moveLocation', (data) => {
    const player = players.get(data.playerId);
    const location = LOCATIONS.find(l => l.id === data.locationId);
    
    if (player && location) {
      player.currentLocation = location.id;
      player.x = location.x;
      player.y = location.y;

      io.emit('playerMoved', {
        playerId: player.id,
        username: player.username,
        location: location.id,
        x: location.x,
        y: location.y
      });
    }
  });

  socket.on('workJob', (data) => {
    const result = workJob(data.playerId, data.jobId);
    socket.emit('workResult', result);
    
    if (result.success) {
      io.emit('playerUpdated', {
        playerId: data.playerId,
        money: players.get(data.playerId).money
      });
    }
  });

  socket.on('attendClass', (data) => {
    const result = attendClass(data.playerId);
    socket.emit('classResult', result);
  });

  socket.on('sendMoney', (data) => {
    const result = sendMoney(data.fromId, data.toUsername, data.amount);
    socket.emit('moneyResult', result);
  });

  socket.on('sendMessage', (data) => {
    const result = sendMessage(data.fromId, data.toUsername, data.content);
    const toPlayer = Array.from(players.values()).find(p => p.username === data.toUsername);
    
    if (result.success && toPlayer && toPlayer.socketId) {
      io.to(toPlayer.socketId).emit('messageReceived', result.message);
    }
    socket.emit('messageSent', result);
  });

  socket.on('sendRelationshipRequest', (data) => {
    const fromPlayer = players.get(data.fromId);
    const toPlayer = Array.from(players.values()).find(p => p.username === data.toUsername);

    if (fromPlayer && toPlayer) {
      if (fromPlayer.relationships.length >= 4) {
        socket.emit('relationshipError', { message: 'Max 4 relationships' });
        return;
      }

      const request = {
        from: fromPlayer.username,
        fromId: fromPlayer.id,
        status: 'pending',
        timestamp: new Date()
      };

      if (!toPlayer.relationshipRequests) {
        toPlayer.relationshipRequests = [];
      }
      toPlayer.relationshipRequests.push(request);

      if (toPlayer.socketId) {
        io.to(toPlayer.socketId).emit('relationshipRequest', request);
      }
    }
  });

  socket.on('respondRelationship', (data) => {
    const player = players.get(data.playerId);
    const otherPlayer = Array.from(players.values()).find(p => p.username === data.fromUsername);

    if (player && otherPlayer && data.accept) {
      const rel1 = { partner: otherPlayer.username, since: new Date() };
      const rel2 = { partner: player.username, since: new Date() };

      player.relationships.push(rel1);
      otherPlayer.relationships.push(rel2);

      io.emit('relationshipFormed', {
        player1: player.username,
        player2: otherPlayer.username
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
    // Find and update player
    for (let [id, player] of players) {
      if (player.socketId === socket.id) {
        io.emit('playerLeft', { playerId: id, username: player.username });
        break;
      }
    }
  });
});

// ============ START SERVER ============

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🎮 OAU LIFE Server running on port ${PORT}`);
  console.log(`📍 API: http://localhost:${PORT}`);
  console.log(`🌐 WebSocket ready for multiplayer`);
});
