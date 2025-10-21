import Phaser from 'phaser';

export default class Player extends Phaser.GameObjects.Container {
  constructor(scene, x, y, data) {
    super(scene, x, y);

    this.scene = scene;
    this.playerData = data;

    // Store stats
    this.setData('health', data.health || data.maxHealth);
    this.setData('maxHealth', data.maxHealth);
    this.setData('speed', data.speed);
    this.setData('damage', data.damage);
    this.setData('attackSpeed', data.attackSpeed);
    this.setData('class', data.class);
    this.setData('lastFired', 0);

    // Create character sprite based on class
    this.createCharacter(data.class);

    // Add glow effect
    this.createGlow();

    // Add to scene
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setCircle(20);
    this.body.setCollideWorldBounds(true);

    // Name tag
    this.nameText = scene.add.text(0, -50, data.name || 'Player', {
      fontSize: '14px',
      fill: '#ffffff',
      fontFamily: 'Courier New',
      backgroundColor: '#000000',
      padding: { x: 4, y: 2 }
    });
    this.nameText.setOrigin(0.5);
    this.add(this.nameText);

    // Health bar
    this.healthBarBg = scene.add.rectangle(0, -35, 60, 6, 0x333333);
    this.healthBar = scene.add.rectangle(-30, -35, 60, 6, 0x00ff00);
    this.healthBar.setOrigin(0, 0.5);
    this.add(this.healthBarBg);
    this.add(this.healthBar);
  }

  createCharacter(characterClass) {
    switch (characterClass) {
      case 'scavenger':
        this.createScavenger();
        break;
      case 'forgeguard':
        this.createForgeguard();
        break;
      case 'riftrunner':
        this.createRiftrunner();
        break;
      default:
        this.createScavenger();
    }
  }

  createScavenger() {
    // Body - sleek and agile looking
    const body = this.scene.add.graphics();
    body.fillStyle(0x4a9eff, 1);
    body.fillEllipse(0, 0, 30, 40);

    // Armor plating
    body.fillStyle(0x6bb3ff, 1);
    body.fillRect(-12, -15, 24, 8);
    body.fillRect(-12, 0, 24, 8);

    // Visor
    body.fillStyle(0x00d4ff, 1);
    body.fillEllipse(0, -10, 20, 12);

    // Rifle
    const rifle = this.scene.add.graphics();
    rifle.fillStyle(0x333333, 1);
    rifle.fillRect(15, -3, 25, 6);
    rifle.fillStyle(0xff6b35, 1);
    rifle.fillCircle(38, 0, 4);

    // Ammo pack
    body.fillStyle(0xff9966, 1);
    body.fillRect(-8, 10, 16, 12);

    this.add([body, rifle]);
  }

  createForgeguard() {
    // ROBOT - Large, mechanical body
    const body = this.scene.add.graphics();

    // Main chassis - metallic
    body.fillStyle(0x888888, 1);
    body.fillRect(-20, -25, 40, 50);

    // Metal plating with rivets
    body.fillStyle(0xaaaaaa, 1);
    body.fillRect(-22, -20, 44, 10);
    body.fillRect(-22, -5, 44, 10);
    body.fillRect(-22, 10, 44, 10);

    // Rivets
    body.fillStyle(0x555555, 1);
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 5; j++) {
        body.fillCircle(-18 + j * 9, -18 + i * 15, 2);
      }
    }

    // Hydraulic shoulder joints
    body.fillStyle(0x666666, 1);
    body.fillRect(-28, -25, 12, 20);
    body.fillRect(16, -25, 12, 20);

    // Hydraulic pistons
    body.lineStyle(4, 0x444444, 1);
    body.lineBetween(-22, -20, -22, -5);
    body.lineBetween(22, -20, 22, -5);

    // Robot head - angular
    body.fillStyle(0xff4a4a, 1);
    body.fillRect(-15, -35, 30, 20);

    // Antenna
    body.lineStyle(2, 0xff6b35, 1);
    body.lineBetween(-8, -35, -8, -42);
    body.lineBetween(8, -35, 8, -42);
    body.fillStyle(0xff0000, 1);
    body.fillCircle(-8, -42, 3);
    body.fillCircle(8, -42, 3);

    // LED Visor/Eyes
    const visor = this.scene.add.graphics();
    visor.fillStyle(0xffaa00, 1);
    visor.fillRect(-12, -30, 10, 5);
    visor.fillRect(2, -30, 10, 5);

    // Pulsing LED effect
    this.scene.tweens.add({
      targets: visor,
      alpha: 0.5,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });

    // Power core (visible through chest)
    const core = this.scene.add.circle(0, 0, 8, 0xff6b35);
    this.scene.tweens.add({
      targets: core,
      scale: 1.3,
      alpha: 0.7,
      duration: 1200,
      yoyo: true,
      repeat: -1
    });

    // Exhaust vents
    body.fillStyle(0x333333, 1);
    body.fillRect(-18, 15, 5, 8);
    body.fillRect(-8, 15, 5, 8);
    body.fillRect(3, 15, 5, 8);
    body.fillRect(13, 15, 5, 8);

    // Mechanical legs (simple)
    body.fillStyle(0x777777, 1);
    body.fillRect(-15, 25, 10, 15);
    body.fillRect(5, 25, 10, 15);

    // Knee joints
    body.fillStyle(0x555555, 1);
    body.fillCircle(-10, 32, 4);
    body.fillCircle(10, 32, 4);

    // Heavy hammer weapon
    const hammer = this.scene.add.graphics();
    hammer.fillStyle(0x555555, 1);
    hammer.fillRect(20, -5, 5, 35);

    // Hammer head - mechanical
    hammer.fillStyle(0x888888, 1);
    hammer.fillRect(12, 25, 20, 18);

    // Hammer tech details
    hammer.fillStyle(0xff4a4a, 1);
    hammer.fillRect(14, 27, 16, 3);
    hammer.fillRect(14, 33, 16, 3);
    hammer.fillRect(14, 39, 16, 3);

    // Energy cell in hammer
    const hammerGlow = this.scene.add.circle(22, 34, 5, 0xff6b35);
    this.scene.tweens.add({
      targets: hammerGlow,
      alpha: 0.6,
      duration: 800,
      yoyo: true,
      repeat: -1
    });

    this.add([body, core, visor, hammer, hammerGlow]);
  }

  createRiftrunner() {
    // Slim, agile body
    const body = this.scene.add.graphics();
    body.fillStyle(0x9d4aff, 1);
    body.fillEllipse(0, 0, 25, 45);

    // Energy lines
    body.lineStyle(2, 0xdd99ff, 1);
    body.strokeRect(-10, -15, 20, 30);

    // Hood
    body.fillStyle(0x7733cc, 1);
    body.fillTriangle(-15, -20, 15, -20, 0, -35);

    // Mask/visor
    body.fillStyle(0xff00ff, 1);
    body.fillEllipse(0, -15, 18, 10);

    // Daggers (dual wield)
    const dagger1 = this.scene.add.graphics();
    dagger1.fillStyle(0xaaaaaa, 1);
    dagger1.fillTriangle(18, -5, 18, 5, 35, 0);
    dagger1.fillStyle(0xdd99ff, 1);
    dagger1.fillRect(18, -2, 5, 4);

    const dagger2 = this.scene.add.graphics();
    dagger2.fillStyle(0xaaaaaa, 1);
    dagger2.fillTriangle(-18, -5, -18, 5, -35, 0);
    dagger2.fillStyle(0xdd99ff, 1);
    dagger2.fillRect(-23, -2, 5, 4);

    // Energy aura
    const aura = this.scene.add.graphics();
    aura.lineStyle(2, 0xff00ff, 0.3);
    aura.strokeCircle(0, 0, 35);
    aura.strokeCircle(0, 0, 40);

    this.add([aura, body, dagger1, dagger2]);

    // Add pulsing animation for Riftrunner
    this.scene.tweens.add({
      targets: aura,
      alpha: 0.1,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });
  }

  createGlow() {
    const glowColor = this.getGlowColor(this.getData('class'));
    const glow = this.scene.add.circle(0, 0, 45, glowColor, 0.2);
    this.addAt(glow, 0);

    this.scene.tweens.add({
      targets: glow,
      scale: 1.2,
      alpha: 0.1,
      duration: 1500,
      yoyo: true,
      repeat: -1
    });
  }

  getGlowColor(characterClass) {
    switch (characterClass) {
      case 'scavenger': return 0x4a9eff;
      case 'forgeguard': return 0xff4a4a;
      case 'riftrunner': return 0x9d4aff;
      default: return 0xffffff;
    }
  }

  updateHealthBar() {
    const health = this.getData('health');
    const maxHealth = this.getData('maxHealth');
    const healthPercent = health / maxHealth;

    this.healthBar.setScale(healthPercent, 1);

    if (healthPercent > 0.6) {
      this.healthBar.setFillStyle(0x00ff00);
    } else if (healthPercent > 0.3) {
      this.healthBar.setFillStyle(0xffaa00);
    } else {
      this.healthBar.setFillStyle(0xff0000);
    }
  }

  preUpdate() {
    this.updateHealthBar();
  }
}
