import Phaser from 'phaser';

export default class Enemy extends Phaser.GameObjects.Container {
  constructor(scene, x, y, type, zone = 1) {
    super(scene, x, y);

    this.scene = scene;
    this.enemyType = type;

    // Enemy stats based on type and zone
    const stats = this.getEnemyStats(type, zone);
    this.setData('health', stats.health);
    this.setData('maxHealth', stats.health);
    this.setData('speed', stats.speed);
    this.setData('damage', stats.damage);
    this.setData('type', type);

    // Create enemy visual
    this.createEnemyVisual(type);

    // Add to scene
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setCircle(stats.size);

    // Health bar
    this.healthBarBg = scene.add.rectangle(0, -40, 40, 4, 0x333333);
    this.healthBar = scene.add.rectangle(-20, -40, 40, 4, 0xff0000);
    this.healthBar.setOrigin(0, 0.5);
    this.add(this.healthBarBg);
    this.add(this.healthBar);
  }

  getEnemyStats(type, zone) {
    const baseStats = {
      basic: { health: 30, speed: 80, damage: 10, size: 15 },
      fast: { health: 20, speed: 150, damage: 8, size: 12 },
      tank: { health: 80, speed: 50, damage: 20, size: 25 },
      exploder: { health: 25, speed: 100, damage: 30, size: 18 }
    };

    const stats = baseStats[type] || baseStats.basic;

    // Scale with zone
    return {
      health: stats.health * (1 + zone * 0.3),
      speed: stats.speed,
      damage: stats.damage * (1 + zone * 0.2),
      size: stats.size
    };
  }

  createEnemyVisual(type) {
    switch (type) {
      case 'basic':
        this.createBasicEnemy();
        break;
      case 'fast':
        this.createFastEnemy();
        break;
      case 'tank':
        this.createTankEnemy();
        break;
      case 'exploder':
        this.createExploderEnemy();
        break;
      default:
        this.createBasicEnemy();
    }
  }

  createBasicEnemy() {
    // Corrupted creature - spider-like
    const body = this.scene.add.graphics();

    // Main body
    body.fillStyle(0x663333, 1);
    body.fillEllipse(0, 0, 30, 25);

    // Pulsing core
    const core = this.scene.add.circle(0, 0, 8, 0xff3333);
    this.scene.tweens.add({
      targets: core,
      scale: 1.3,
      alpha: 0.6,
      duration: 800,
      yoyo: true,
      repeat: -1
    });

    // Spider legs
    body.lineStyle(3, 0x442222, 1);
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 / 6) * i;
      const legLength = 20;
      body.lineBetween(
        Math.cos(angle) * 10,
        Math.sin(angle) * 8,
        Math.cos(angle) * legLength,
        Math.sin(angle) * legLength
      );

      // Leg joints
      body.fillStyle(0x553333, 1);
      body.fillCircle(
        Math.cos(angle) * legLength,
        Math.sin(angle) * legLength,
        3
      );
    }

    // Eyes
    body.fillStyle(0xff6b35, 1);
    body.fillCircle(-6, -4, 4);
    body.fillCircle(6, -4, 4);

    this.add([body, core]);
  }

  createFastEnemy() {
    // Sleek, agile creature
    const body = this.scene.add.graphics();

    // Streamlined body
    body.fillStyle(0x9933ff, 1);
    body.fillEllipse(0, 0, 20, 35);

    // Energy trail
    const trail = this.scene.add.graphics();
    trail.fillStyle(0xdd99ff, 0.5);
    trail.fillEllipse(-5, 0, 15, 30);

    this.scene.tweens.add({
      targets: trail,
      alpha: 0.2,
      scaleX: 0.7,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // Speed lines
    body.lineStyle(2, 0xdd99ff, 0.8);
    body.lineBetween(-15, -8, -25, -10);
    body.lineBetween(-15, 0, -28, 0);
    body.lineBetween(-15, 8, -25, 10);

    // Sharp edges
    body.fillStyle(0xaa00ff, 1);
    body.fillTriangle(10, 0, 0, -8, 0, 8);

    // Eyes
    body.fillStyle(0x00ffff, 1);
    body.fillCircle(0, -6, 3);
    body.fillCircle(0, 6, 3);

    this.add([trail, body]);
  }

  createTankEnemy() {
    // Heavy armored creature
    const body = this.scene.add.graphics();

    // Large body
    body.fillStyle(0x555555, 1);
    body.fillRect(-25, -25, 50, 50);

    // Armor plates
    body.fillStyle(0x777777, 1);
    body.fillRect(-28, -28, 56, 12);
    body.fillRect(-28, -8, 56, 12);
    body.fillRect(-28, 12, 56, 12);

    // Spikes
    body.fillStyle(0x444444, 1);
    for (let i = 0; i < 4; i++) {
      const x = -20 + i * 13;
      body.fillTriangle(x, -28, x + 6, -28, x + 3, -38);
    }

    // Core
    const core = this.scene.add.circle(0, 0, 12, 0xff0000);
    this.scene.tweens.add({
      targets: core,
      alpha: 0.5,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });

    // Weak spots
    body.fillStyle(0xff6b35, 0.6);
    body.fillCircle(-15, -15, 5);
    body.fillCircle(15, -15, 5);
    body.fillCircle(-15, 15, 5);
    body.fillCircle(15, 15, 5);

    this.add([body, core]);
  }

  createExploderEnemy() {
    // Volatile, bomb-like creature
    const body = this.scene.add.graphics();

    // Spherical body
    body.fillStyle(0xff6b00, 1);
    body.fillCircle(0, 0, 18);

    // Inner glow
    const glow = this.scene.add.circle(0, 0, 12, 0xffaa00);
    this.scene.tweens.add({
      targets: glow,
      scale: 1.5,
      alpha: 0.3,
      duration: 600,
      yoyo: true,
      repeat: -1
    });

    // Warning stripes
    body.fillStyle(0xffff00, 1);
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 / 6) * i;
      const x = Math.cos(angle) * 12;
      const y = Math.sin(angle) * 12;
      body.fillTriangle(
        x, y,
        Math.cos(angle + 0.3) * 18,
        Math.sin(angle + 0.3) * 18,
        Math.cos(angle - 0.3) * 18,
        Math.sin(angle - 0.3) * 18
      );
    }

    // Fuse/wick
    body.lineStyle(3, 0x333333, 1);
    body.lineBetween(0, -18, 0, -28);
    const spark = this.scene.add.circle(0, -28, 4, 0xffff00);
    this.scene.tweens.add({
      targets: spark,
      scale: 1.5,
      duration: 400,
      yoyo: true,
      repeat: -1
    });

    this.add([body, glow, spark]);

    // Pulsing warning
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 700,
      yoyo: true,
      repeat: -1
    });
  }

  update(time, delta) {
    // Update health bar
    const health = this.getData('health');
    const maxHealth = this.getData('maxHealth');
    const healthPercent = health / maxHealth;

    this.healthBar.setScale(healthPercent, 1);

    // Floating animation
    this.y += Math.sin(time / 300 + this.x) * 0.3;
  }
}
