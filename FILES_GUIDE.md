# 📂 Files & How to Use Them

## Your Downloads

You now have **everything needed** to launch OAU LIFE. Here's what you got:

```
📦 YOUR OAU LIFE PACKAGE
│
├── 📁 oau-life-game/                 ← THE GAME (Copy this anywhere)
│   ├── server.js                      (12 KB) Backend server
│   ├── index.html                     (30 KB) Game client
│   ├── package.json                   (450 B) Dependencies list
│   ├── README.md                      (6.3 KB) Full documentation
│   └── .gitignore                     (130 B) Git config
│
├── 📄 QUICK_START.md                 ← Start here! (Read first)
├── 📄 BUILD_SUMMARY.md               ← What I built (Read second)
└── 📄 FILES_GUIDE.md                 ← This file
```

---

## 📖 Which File to Read When

### 🟢 JUST GETTING STARTED?
**Read:** `QUICK_START.md`
- 3-step setup
- How to play
- Troubleshooting

### 🟡 WANT TO UNDERSTAND EVERYTHING?
**Read:** `BUILD_SUMMARY.md`
- Complete feature list
- Architecture overview
- Deployment options
- Roadmap

### 🔵 NEED FULL DOCUMENTATION?
**Read:** `oau-life-game/README.md`
- Detailed game mechanics
- API endpoints
- Customization guide
- Deployment guide

### 🟣 JUST WANT TO PLAY?
**Follow:** `QUICK_START.md` Step 2-3
1. `npm install`
2. `npm start`
3. Open `http://localhost:5000/index.html`
4. Create character
5. Play!

---

## 🎮 Game Files Explained

### `server.js` (12 KB)
**What it is:** The backend server that runs your game

**What it does:**
- Listens for player connections
- Manages game state (who's where, how much money, etc.)
- Handles multiplayer (tells all players about each other)
- Processes actions (jobs, money transfers, relationships, etc.)
- Sends/receives messages

**When it runs:** `npm start`

**Port:** 5000 (can change if needed)

### `index.html` (30 KB)
**What it is:** The entire game in one HTML file

**What it does:**
- Shows the campus map (with Phaser)
- Displays the phone UI
- Connects to the server
- Handles all game features
- Saves your local data

**When you use it:** Open in browser after server starts

**URL:** `http://localhost:5000/index.html`

### `package.json` (450 B)
**What it is:** A list of code dependencies

**What's in it:**
- express (web framework)
- socket.io (multiplayer)
- cors (cross-origin requests)
- jsonwebtoken (security)
- pg (database support for future)

**When it's used:** During `npm install`

---

## 📋 How They Work Together

```
Browser (You Playing)
    ↓
index.html (Game Client)
    ↓
Socket.io Connection
    ↓
server.js (Game Server)
    ↓
Game State (Players, Money, Locations, etc.)
    ↓
Broadcasting Updates Back to All Players
    ↓
All Browsers Update in Real-Time ✨
```

---

## 🚀 One Command Launch

```bash
cd oau-life-game
npm install    # Download dependencies
npm start      # Start server
```

Then in browser:
```
http://localhost:5000/index.html
```

That's it! You're playing.

---

## 🛠️ If You Want to Customize

### Add a New Location
Edit `oau-life-game/server.js`, find `LOCATIONS` array, add:
```javascript
{ id: 'beach', name: 'Beach', x: 600, y: 300 }
```

### Add a New Job
Edit `oau-life-game/server.js`, find `JOBS` array, add:
```javascript
{ id: 'lifeguard', name: 'Lifeguard', pay: 8000, duration: 12, location: 'beach' }
```

### Change Starting Money
Edit `oau-life-game/server.js`, find:
```javascript
money: isNepoBaby ? 500000 : 20000,
```
Change to your preferred amounts.

### Change Game Speed
The game time advances by 1-2 hours per action. You can adjust this in `server.js`, search for `increaseGameTime()`.

---

## 📱 Features by File

### In `server.js` (Backend):
✅ Job system
✅ Money system
✅ Class attendance
✅ Relationship matching
✅ Message routing
✅ Multiplayer sync
✅ Player creation
✅ Game time management

### In `index.html` (Frontend):
✅ Game map (Phaser)
✅ Character display
✅ Phone UI
✅ Dashboard
✅ School Portal
✅ Messages app
✅ Banking app
✅ Location list
✅ Jobs list
✅ Relationships app
✅ Character creation form

---

## 🌐 Multiplayer How It Works

When you run the server, it can handle **unlimited players** (well, depends on your computer):

1. **Player A** opens `http://localhost:5000/index.html`
2. Creates character "Chioma"
3. **Player B** opens same URL on different browser tab
4. Creates character "Amara"
5. Both see each other on map
6. Both can message each other
7. Both can work, earn money, attend classes
8. Everything syncs in real-time

The server keeps everyone in sync. When one player moves, all see it.

---

## 📊 What Data Is Stored

### Per Player:
- Username
- Gender  
- CGPA
- Level
- Money balance
- Current location
- Hostel assignment
- Classes attended
- Relationships
- Messages
- Avatar customization

### Server Keeps:
- All player data (while running)
- All messages (while running)
- All game state (while running)

**Note:** Currently stored in memory. On restart, data resets. To keep data permanently, upgrade to PostgreSQL (easy step in future).

---

## 🎯 The 3-Step Setup

**Step 1: Install**
```bash
cd oau-life-game
npm install
```
(Wait 1-2 minutes)

**Step 2: Start**
```bash
npm start
```
(Should see "OAU LIFE Server running on port 5000")

**Step 3: Play**
Open: `http://localhost:5000/index.html`
(Create character, start playing)

---

## 🚀 Deployment Files (Later)

When you're ready to go online, you'll need:

- **package.json** ✅ Already there
- **server.js** ✅ Already there
- **index.html** ✅ Already there
- **.gitignore** ✅ Already there
- **GitHub account** (create free at github.com)
- **Railway/Render account** (create free, connect to GitHub)

Just push these files to GitHub, connect to Railway/Render, and it auto-deploys!

---

## 📞 File Support

**Issue with `server.js`?**
- Check the console for error messages
- Make sure `npm install` completed
- Try `npm start` again

**Issue with `index.html`?**
- Press F12 (or Ctrl+Shift+I) to open developer tools
- Check the Console tab for errors
- Try refreshing (Ctrl+R)

**Issue with `package.json`?**
- Make sure you're in the right folder
- Try `npm install` again
- Check your internet connection

---

## 🎉 Ready to Go!

You have **everything you need**. The game is **complete** and **ready to play**.

1. Download all files ✅
2. Read `QUICK_START.md` ✅
3. Run `npm install` and `npm start` ✅
4. Open game in browser ✅
5. Create character ✅
6. Play! ✅

**Enjoy OAU LIFE!** 🚀
