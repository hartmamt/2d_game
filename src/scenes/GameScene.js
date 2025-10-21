import Phaser from 'phaser';
import io from 'socket.io-client';
import Player from '../entities/Player.js';
import Enemy from '../entities/Enemy.js';
import Boss from '../entities/Boss.js';
import Projectile from '../entities/Projectile.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init(data) {
    this.playerName = data.playerName || 'Player';
    this.characterClass = data.characterClass || 'scavenger';
  }

  create() {
    // Connect to server
    const serverUrl = window.location.hostname === 'localhost'
      ? 'http://localhost:3001'
      : window.location.origin;

    this.socket = io(serverUrl);

    // Game state
    this.players = new Map();
    this.enemies = new Map();
    this.bosses = new Map();
    this.projectiles = [];
    this.items = [];

    this.currentZone = 1;
    this.timelineLoops = 0;
    this.score = 0;
    this.scrap = 0;

    // Create world
    this.createWorld();

    // Groups
    this.playerGroup = this.physics.add.group();
    this.enemyGroup = this.physics.add.group();
    this.bossGroup = this.physics.add.group();
    this.projectileGroup = this.physics.add.group();

    // Input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = {
      up: this.input.keyboard.addKey('W'),
      down: this.input.keyboard.addKey('S'),
      left: this.input.keyboard.addKey('A'),
      right: this.input.keyboard.addKey('D')
    };
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Socket events
    this.setupSocketEvents();

    // Join game
    this.socket.emit('joinGame', {
      playerName: this.playerName,
      characterClass: this.characterClass,
      roomId: 'default'
    });

    // Camera
    this.cameras.main.setBounds(0, 0, 2000, 2000);
    this.cameras.main.setZoom(1);

    // Start UI scene
    this.scene.launch('UIScene');

    // Spawn enemies
    this.time.addEvent({
      delay: 3000,
      callback: this.spawnEnemyWave,
      callbackScope: this,
      loop: true
    });

    // Boss spawn
    this.time.addEvent({
      delay: 60000,
      callback: () => this.spawnBoss('lava_leviathan'),
      callbackScope: this,
      loop: false
    });
  }

  createWorld() {
    // Ground
    const graphics = this.add.graphics();

    // Create alien moon surface with varied terrain
    for (let x = 0; x < 2000; x += 100) {
      for (let y = 0; y < 2000; y += 100) {
        const shade = 0x1a0f0f + Math.floor(Math.random() * 0x0a0505);
        graphics.fillStyle(shade, 1);
        graphics.fillRect(x, y, 100, 100);

        // Add some cracks and details
        if (Math.random() > 0.7) {
          graphics.lineStyle(2, 0xff6b35, 0.3);
          graphics.lineBetween(
            x + Math.random() * 100,
            y + Math.random() * 100,
            x + Math.random() * 100,
            y + Math.random() * 100
          );
        }
      }
    }

    // Add environmental hazards
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * 2000;
      const y = Math.random() * 2000;

      // Lava pools
      graphics.fillStyle(0xff4400, 0.6);
      graphics.fillCircle(x, y, 30 + Math.random() * 30);

      graphics.fillStyle(0xff6b00, 0.8);
      graphics.fillCircle(x, y, 20 + Math.random() * 20);
    }
  }

  setupSocketEvents() {
    this.socket.on('gameJoined', (data) => {
      this.playerId = data.playerId;

      // Create player immediately
      const characterStats = {
        scavenger: { maxHealth: 100, speed: 200, damage: 15, attackSpeed: 0.2 },
        forgeguard: { maxHealth: 200, speed: 100, damage: 40, attackSpeed: 0.8 },
        riftrunner: { maxHealth: 75, speed: 250, damage: 25, attackSpeed: 0.3 }
      };

      const stats = characterStats[this.characterClass] || characterStats.scavenger;
      const playerData = {
        id: this.playerId,
        name: this.playerName,
        class: this.characterClass,
        x: 1000,
        y: 1000,
        health: stats.maxHealth,
        maxHealth: stats.maxHealth,
        speed: stats.speed,
        damage: stats.damage,
        attackSpeed: stats.attackSpeed
      };

      this.player = new Player(this, playerData.x, playerData.y, playerData);
      this.playerGroup.add(this.player);
      this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    });

    this.socket.on('gameState', (state) => {
      // Update other players
      state.players.forEach(playerData => {
        if (playerData.id !== this.playerId) {
          if (!this.players.has(playerData.id)) {
            const otherPlayer = new Player(this, playerData.x, playerData.y, playerData);
            this.players.set(playerData.id, otherPlayer);
            this.playerGroup.add(otherPlayer);
          } else {
            const otherPlayer = this.players.get(playerData.id);
            otherPlayer.setPosition(playerData.x, playerData.y);
          }
        }
      });

      this.currentZone = state.zone;
      this.timelineLoops = state.timelineLoops;
    });

    this.socket.on('playerMoved', (data) => {
      if (data.id !== this.playerId && this.players.has(data.id)) {
        const player = this.players.get(data.id);
        player.setPosition(data.x, data.y);
        player.setRotation(data.rotation);
      }
    });

    this.socket.on('playerShot', (data) => {
      if (data.id !== this.playerId) {
        const player = this.players.get(data.id);
        if (player) {
          this.createProjectile(player.x, player.y, data.angle, data.characterClass);
        }
      }
    });

    this.socket.on('enemySpawned', (data) => {
      const enemy = new Enemy(this, data.x, data.y, data.type);
      this.enemies.set(data.id, enemy);
      this.enemyGroup.add(enemy);
    });

    this.socket.on('enemyDestroyed', (data) => {
      if (this.enemies.has(data.enemyId)) {
        const enemy = this.enemies.get(data.enemyId);
        enemy.destroy();
        this.enemies.delete(data.enemyId);
      }
    });

    this.socket.on('playerLeft', (data) => {
      if (this.players.has(data.id)) {
        this.players.get(data.id).destroy();
        this.players.delete(data.id);
      }
    });

    this.socket.on('timelineAugmented', (data) => {
      this.timelineLoops = data.loops;
      this.showTimelineMessage(data.loops, data.multiplier);
    });
  }

  update(time, delta) {
    if (!this.player) return;

    // Player movement
    const speed = this.player.getData('speed') || 200;
    let velocityX = 0;
    let velocityY = 0;

    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      velocityX = -speed;
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      velocityX = speed;
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      velocityY = -speed;
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      velocityY = speed;
    }

    this.player.setVelocity(velocityX, velocityY);

    // Emit player position
    if (velocityX !== 0 || velocityY !== 0) {
      this.socket.emit('playerMove', {
        x: this.player.x,
        y: this.player.y,
        rotation: this.player.rotation
      });
    }

    // Shooting
    const pointer = this.input.activePointer;
    const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
    const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, worldPoint.x, worldPoint.y);
    this.player.setRotation(angle);

    if (pointer.isDown && time > this.player.getData('lastFired')) {
      this.shootProjectile(angle);
      const attackSpeed = this.player.getData('attackSpeed') || 0.3;
      this.player.setData('lastFired', time + attackSpeed * 1000);
    }

    // Update enemies
    this.enemies.forEach(enemy => {
      if (this.player) {
        const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
        const distance = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);

        if (distance > 50) {
          this.physics.velocityFromRotation(angle, enemy.getData('speed') || 80, enemy.body.velocity);
        } else {
          enemy.setVelocity(0, 0);
        }

        enemy.update(time, delta);
      }
    });

    // Update bosses
    this.bosses.forEach(boss => {
      boss.update(time, delta, this.player);
    });

    // Update projectiles
    this.projectiles.forEach((proj, index) => {
      if (!proj.active) {
        this.projectiles.splice(index, 1);
      }
    });

    // Collisions
    this.physics.overlap(this.projectileGroup, this.enemyGroup, this.projectileHitEnemy, null, this);
    this.physics.overlap(this.projectileGroup, this.bossGroup, this.projectileHitBoss, null, this);
    this.physics.overlap(this.playerGroup, this.enemyGroup, this.enemyHitPlayer, null, this);

    // Update UI
    this.scene.get('UIScene').updateUI({
      health: this.player.getData('health'),
      maxHealth: this.player.getData('maxHealth'),
      zone: this.currentZone,
      score: this.score,
      scrap: this.scrap,
      timelineLoops: this.timelineLoops
    });
  }

  shootProjectile(angle) {
    const projectile = new Projectile(
      this,
      this.player.x,
      this.player.y,
      angle,
      this.characterClass
    );
    this.projectiles.push(projectile);
    this.projectileGroup.add(projectile);

    this.socket.emit('playerShoot', {
      angle: angle,
      characterClass: this.characterClass
    });
  }

  createProjectile(x, y, angle, characterClass) {
    const projectile = new Projectile(this, x, y, angle, characterClass);
    this.projectiles.push(projectile);
    this.projectileGroup.add(projectile);
  }

  projectileHitEnemy(projectile, enemy) {
    const damage = this.player.getData('damage') || 15;
    const enemyHealth = enemy.getData('health') || 0;
    enemy.setData('health', enemyHealth - damage);

    // Visual feedback
    enemy.setTint(0xff0000);
    this.time.delayedCall(100, () => {
      if (enemy.active) enemy.clearTint();
    });

    projectile.destroy();

    if (enemy.getData('health') <= 0) {
      this.createExplosion(enemy.x, enemy.y, 0xff6b35);
      enemy.destroy();
      this.score += 100;
      this.scrap += 10;

      this.socket.emit('enemyKilled', { enemyId: enemy.getData('id') });
    }
  }

  projectileHitBoss(projectile, boss) {
    const damage = this.player.getData('damage') || 15;
    boss.takeDamage(damage);
    projectile.destroy();
  }

  enemyHitPlayer(player, enemy) {
    const now = Date.now();
    if (!player.getData('lastHit') || now - player.getData('lastHit') > 500) {
      const damage = enemy.getData('damage') || 10;
      const currentHealth = player.getData('health') || 100;
      player.setData('health', Math.max(0, currentHealth - damage));
      player.setData('lastHit', now);

      player.setTint(0xff0000);
      this.time.delayedCall(200, () => {
        if (player.active) player.clearTint();
      });

      if (player.getData('health') <= 0) {
        this.playerDeath();
      }
    }
  }

  spawnEnemyWave() {
    if (!this.player) return;

    const waveSize = 3 + Math.floor(this.currentZone * 1.5);

    for (let i = 0; i < waveSize; i++) {
      const angle = (Math.PI * 2 / waveSize) * i;
      const distance = 400 + Math.random() * 200;
      const x = this.player.x + Math.cos(angle) * distance;
      const y = this.player.y + Math.sin(angle) * distance;

      this.socket.emit('spawnEnemy', {
        x: x,
        y: y,
        type: 'basic',
        zone: this.currentZone
      });
    }
  }

  spawnBoss(bossType) {
    const boss = new Boss(this, 1000, 1000, bossType);
    this.bosses.set(bossType, boss);
    this.bossGroup.add(boss);

    this.cameras.main.flash(1000, 255, 50, 0);

    const text = this.add.text(640, 200, 'BOSS APPROACHING', {
      fontSize: '48px',
      fill: '#ff6b35',
      fontFamily: 'Courier New',
      fontStyle: 'bold'
    });
    text.setOrigin(0.5);
    text.setScrollFactor(0);

    this.tweens.add({
      targets: text,
      alpha: 0,
      duration: 3000,
      onComplete: () => text.destroy()
    });
  }

  createExplosion(x, y, color) {
    const particles = this.add.particles(x, y, 'particle', {
      speed: { min: 100, max: 200 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 600,
      quantity: 20,
      tint: color
    });

    this.time.delayedCall(700, () => particles.destroy());
  }

  playerDeath() {
    this.cameras.main.shake(500, 0.02);
    this.cameras.main.fade(1000, 0, 0, 0);

    this.time.delayedCall(1500, () => {
      this.scene.start('MenuScene');
    });
  }

  showTimelineMessage(loops, multiplier) {
    const text = this.add.text(640, 360,
      `TIMELINE AUGMENTED\nLoop ${loops} | Multiplier x${multiplier.toFixed(1)}`, {
      fontSize: '32px',
      fill: '#ff6b35',
      fontFamily: 'Courier New',
      fontStyle: 'bold',
      align: 'center'
    });
    text.setOrigin(0.5);
    text.setScrollFactor(0);

    this.tweens.add({
      targets: text,
      alpha: 0,
      duration: 3000,
      delay: 2000,
      onComplete: () => text.destroy()
    });
  }
}
