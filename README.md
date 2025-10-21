# Ashen Core

A 4-player online survival roguelike set on a dying alien moon.

## Game Overview

Ashen Core is an intense multiplayer roguelike where you fight through waves of enemies, defeat powerful bosses, and collect stackable items. With infinite ammo and three unique character classes, you'll battle your way to the Ashen Core - the final boss. After victory, you can choose to augment the timeline and restart with all your gear, facing even greater challenges for higher scores!

## Characters

### The Scavenger - The Balanced Marksman
- **Health**: 100
- **Speed**: 200
- **Damage**: 15
- **Attack Speed**: 0.2s
- **Playstyle**: Stay mobile, pick off enemies from a distance with rapid-fire shots. High mobility allows for tactical positioning and kiting.

### The Forgeguard - The Tanky Robot Bruiser
- **Health**: 200
- **Speed**: 100
- **Damage**: 40
- **Attack Speed**: 0.8s
- **Playstyle**: Heavy mechanical warrior. Get up close, absorb damage with your metal chassis, and deal massive damage with your energy hammer. Perfect for frontline combat.

### The Riftrunner - The Agile Assassin
- **Health**: 75
- **Speed**: 250
- **Damage**: 25
- **Attack Speed**: 0.3s
- **Playstyle**: Speed and evasion are your weapons. Strike fast with rift daggers, dodge attacks, and use your mobility to outmaneuver foes. High-risk, high-reward.

## Bosses

1. **Lava Leviathan** - A massive serpent made of living lava
2. **Electric Wraith** - An ethereal entity crackling with electricity
3. **The Golem** - A towering stone behemoth
4. **Ashen Core** - The final boss, a massive flaming core with multiple phases

Each boss has unique attack patterns and drops powerful legendary items!

## Game Features

- **4-Player Online Co-op**: Team up with friends or strangers
- **Timeline Augmentation**: After defeating the Ashen Core, restart with your gear but face harder enemies
- **Infinite Ammo**: Focus on positioning and skill, not resource management
- **Stackable Items**: Boss drops and items stack for powerful synergies
- **Zone Progression**: Fight through increasingly difficult zones
- **Score System**: Compete for high scores with timeline loop multipliers

## Controls

- **WASD** - Movement
- **Mouse** - Aim and Shoot
- **ESC** - Menu

## Deployment to Railway

### Quick Deploy

1. Install Railway CLI:
```bash
npm install -g @railway/cli
```

2. Login to Railway:
```bash
railway login
```

3. Initialize Railway project:
```bash
railway init
```

4. Deploy:
```bash
railway up
```

5. Add a domain (optional):
```bash
railway domain
```

### Manual Setup

1. Create a new project on [Railway.app](https://railway.app)
2. Connect your GitHub repository
3. Railway will auto-detect the configuration from `railway.json`
4. Set environment variables if needed:
   - `NODE_ENV=production`
   - `PORT` (automatically set by Railway)
5. Deploy!

## Local Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

1. Install dependencies:
```bash
npm install
```

2. Run development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:3000`

The game server runs on port 3001 and the client dev server runs on port 3000.

### Production Build

```bash
npm run build
npm start
```

## Tech Stack

- **Game Engine**: Phaser 3
- **Backend**: Node.js + Express
- **Multiplayer**: Socket.io
- **Build Tool**: Vite
- **Deployment**: Railway

## Game Loop

1. Choose your character
2. Join or create a room (up to 4 players)
3. Fight through zones, defeat enemies
4. Activate teleporters to progress
5. Defeat bosses for legendary loot
6. Reach and defeat the Ashen Core
7. Choose: Win and see your score, or Augment Timeline
8. If augmented: Restart with all items, harder enemies, higher multiplier
9. Repeat for ultimate high scores!

## Timeline Augmentation System

After defeating the Ashen Core, you face a choice:

```
────────── VICTORY ──────────

You have defeated the Ashen Core!

[1] End run and see final score
[2] Augment Timeline and restart with all items

Current Timeline Loops: 2
Score Multiplier: x1.5

────────────────────────────
```

Each timeline loop increases:
- Enemy difficulty (+50% per loop)
- Score multiplier (+0.5x per loop)
- Your legend!

## Future Features

- More characters
- Additional bosses
- More items and synergies
- Achievements
- Leaderboards
- Custom game modes

## License

MIT

## Credits

Built with Phaser 3, Socket.io, and determination.

---

**Survive. Adapt. Augment.**
