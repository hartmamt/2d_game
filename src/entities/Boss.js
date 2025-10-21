import Phaser from 'phaser';

export default class Boss extends Phaser.GameObjects.Container {
  constructor(scene, x, y, bossType) {
    super(scene, x, y);

    this.scene = scene;
    this.bossType = bossType;
    this.currentPhase = 1;

    // Boss stats
    const stats = this.getBossStats(bossType);
    this.setData('health', stats.health);
    this.setData('maxHealth', stats.health);
    this.setData('damage', stats.damage);
    this.setData('type', bossType);

    // Create boss visual
    this.createBossVisual(bossType);

    // Add to scene
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setCircle(stats.size);

    // Boss name
    this.nameText = scene.add.text(0, -stats.size - 40, this.getBossName(bossType), {
      fontSize: '24px',
      fill: '#ff6b35',
      fontFamily: 'Courier New',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    });
    this.nameText.setOrigin(0.5);
    this.add(this.nameText);

    // Health bar
    this.healthBarBg = scene.add.rectangle(0, -stats.size - 20, 200, 10, 0x333333);
    this.healthBar = scene.add.rectangle(-100, -stats.size - 20, 200, 10, 0xff0000);
    this.healthBar.setOrigin(0, 0.5);
    this.add(this.healthBarBg);
    this.add(this.healthBar);

    // Attack timer
    this.lastAttack = 0;
  }

  getBossStats(type) {
    const stats = {
      lava_leviathan: { health: 1000, damage: 30, size: 80 },
      electric_wraith: { health: 800, damage: 25, size: 70 },
      golem: { health: 1500, damage: 40, size: 90 },
      ashen_core: { health: 3000, damage: 50, size: 100 }
    };

    return stats[type] || stats.lava_leviathan;
  }

  getBossName(type) {
    const names = {
      lava_leviathan: 'LAVA LEVIATHAN',
      electric_wraith: 'ELECTRIC WRAITH',
      golem: 'THE GOLEM',
      ashen_core: 'ASHEN CORE'
    };

    return names[type] || 'BOSS';
  }

  createBossVisual(type) {
    switch (type) {
      case 'lava_leviathan':
        this.createLavaLeviathan();
        break;
      case 'electric_wraith':
        this.createElectricWraith();
        break;
      case 'golem':
        this.createGolem();
        break;
      case 'ashen_core':
        this.createAshenCore();
        break;
      default:
        this.createLavaLeviathan();
    }
  }

  createLavaLeviathan() {
    // Massive serpent-like creature made of lava
    const body = this.scene.add.graphics();

    // Main body segments
    for (let i = 0; i < 5; i++) {
      const y = i * 30 - 60;
      const size = 70 - i * 5;

      // Lava segment
      body.fillStyle(0xff3300, 1);
      body.fillEllipse(0, y, size, 35);

      // Cooling crust
      body.fillStyle(0x331100, 0.8);
      body.fillEllipse(-10, y - 5, 20, 8);
      body.fillEllipse(10, y + 5, 20, 8);
    }

    // Head
    body.fillStyle(0xff6600, 1);
    body.fillEllipse(0, -90, 80, 60);

    // Eyes - glowing
    const eye1 = this.scene.add.circle(-20, -100, 12, 0xffff00);
    const eye2 = this.scene.add.circle(20, -100, 12, 0xffff00);

    this.scene.tweens.add({
      targets: [eye1, eye2],
      alpha: 0.5,
      scale: 0.8,
      duration: 1500,
      yoyo: true,
      repeat: -1
    });

    // Horns
    body.fillStyle(0x662200, 1);
    body.fillTriangle(-30, -110, -45, -130, -20, -115);
    body.fillTriangle(30, -110, 45, -130, 20, -115);

    // Lava drips
    const drips = this.scene.add.graphics();
    for (let i = 0; i < 8; i++) {
      const x = (Math.random() - 0.5) * 100;
      const y = (Math.random() - 0.5) * 100;
      drips.fillStyle(0xff6600, 0.8);
      drips.fillCircle(x, y, 4);
    }

    // Pulsing lava glow
    const glow = this.scene.add.circle(0, 0, 100, 0xff6600, 0.3);
    this.scene.tweens.add({
      targets: glow,
      scale: 1.3,
      alpha: 0.1,
      duration: 2000,
      yoyo: true,
      repeat: -1
    });

    // Particle emitter for lava
    const particles = this.scene.add.particles(0, 0, 'particle', {
      speed: 20,
      scale: { start: 0.5, end: 0 },
      alpha: { start: 1, end: 0 },
      tint: [0xff3300, 0xff6600, 0xff9900],
      lifespan: 2000,
      quantity: 2,
      frequency: 100
    });

    this.add([glow, drips, body, eye1, eye2, particles]);
  }

  createElectricWraith() {
    // Ethereal, floating electric entity
    const body = this.scene.add.graphics();

    // Ghostly form
    body.fillStyle(0x0066ff, 0.7);
    body.fillEllipse(0, 0, 100, 120);

    // Electric core
    const core = this.scene.add.circle(0, -20, 30, 0x00ffff);
    this.scene.tweens.add({
      targets: core,
      scale: 1.4,
      alpha: 0.6,
      duration: 800,
      yoyo: true,
      repeat: -1
    });

    // Lightning tendrils
    const tendrils = this.scene.add.graphics();
    tendrils.lineStyle(3, 0x00ffff, 0.8);

    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 / 8) * i;
      let x = 0, y = -20;

      for (let j = 0; j < 5; j++) {
        const nextX = x + Math.cos(angle + Math.random() - 0.5) * 20;
        const nextY = y + Math.sin(angle + Math.random() - 0.5) * 20;
        tendrils.lineBetween(x, y, nextX, nextY);
        x = nextX;
        y = nextY;
      }
    }

    // Animate tendrils
    this.scene.tweens.add({
      targets: tendrils,
      alpha: 0.3,
      duration: 600,
      yoyo: true,
      repeat: -1
    });

    // Electric aura
    const aura = this.scene.add.circle(0, 0, 120, 0x0066ff, 0.2);
    this.scene.tweens.add({
      targets: aura,
      scale: 1.2,
      alpha: 0.05,
      duration: 1500,
      yoyo: true,
      repeat: -1
    });

    // Glowing eyes
    body.fillStyle(0xffffff, 1);
    body.fillCircle(-20, -30, 8);
    body.fillCircle(20, -30, 8);

    // Particles
    const particles = this.scene.add.particles(0, 0, 'particle', {
      speed: { min: 50, max: 100 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 1, end: 0 },
      tint: [0x0066ff, 0x00ffff, 0xffffff],
      lifespan: 1500,
      quantity: 1,
      frequency: 50
    });

    this.add([aura, body, tendrils, core, particles]);

    // Floating motion
    this.scene.tweens.add({
      targets: this,
      y: this.y - 20,
      duration: 3000,
      yoyo: true,
      repeat: -1
    });
  }

  createGolem() {
    // Massive stone golem
    const body = this.scene.add.graphics();

    // Main body - large rectangle
    body.fillStyle(0x666666, 1);
    body.fillRect(-60, -40, 120, 140);

    // Stone texture
    body.fillStyle(0x555555, 1);
    for (let i = 0; i < 10; i++) {
      const x = -50 + Math.random() * 100;
      const y = -30 + Math.random() * 120;
      body.fillRect(x, y, 20, 20);
    }

    // Shoulders
    body.fillStyle(0x777777, 1);
    body.fillRect(-85, -50, 40, 40);
    body.fillRect(45, -50, 40, 40);

    // Head
    body.fillStyle(0x666666, 1);
    body.fillRect(-40, -80, 80, 50);

    // Glowing core (weak spot)
    const core = this.scene.add.circle(0, 20, 25, 0xff6b35);
    this.scene.tweens.add({
      targets: core,
      scale: 1.3,
      alpha: 0.7,
      duration: 1200,
      yoyo: true,
      repeat: -1
    });

    // Eyes
    const eye1 = this.scene.add.circle(-20, -60, 10, 0xff3300);
    const eye2 = this.scene.add.circle(20, -60, 10, 0xff3300);

    this.scene.tweens.add({
      targets: [eye1, eye2],
      alpha: 0.5,
      duration: 2000,
      yoyo: true,
      repeat: -1
    });

    // Cracks (more damage = more cracks)
    body.lineStyle(3, 0xff6b35, 0.5);
    body.lineBetween(-40, -20, 40, 10);
    body.lineBetween(-30, 30, 35, 50);

    // Arms (massive)
    body.fillStyle(0x666666, 1);
    body.fillRect(-100, -20, 30, 80);
    body.fillRect(70, -20, 30, 80);

    // Fists
    body.fillStyle(0x555555, 1);
    body.fillCircle(-85, 70, 20);
    body.fillCircle(85, 70, 20);

    this.add([body, core, eye1, eye2]);
  }

  createAshenCore() {
    // THE FINAL BOSS - Massive flaming core
    const body = this.scene.add.graphics();

    // Outer shell - cracked
    body.fillStyle(0x331100, 1);
    body.fillCircle(0, 0, 100);

    // Cracks revealing inner fire
    body.lineStyle(8, 0xff3300, 1);
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 / 12) * i;
      body.lineBetween(
        Math.cos(angle) * 50,
        Math.sin(angle) * 50,
        Math.cos(angle) * 100,
        Math.sin(angle) * 100
      );
    }

    // Inner core - pulsing
    const core1 = this.scene.add.circle(0, 0, 70, 0xff6600);
    const core2 = this.scene.add.circle(0, 0, 50, 0xff9900);
    const core3 = this.scene.add.circle(0, 0, 30, 0xffcc00);

    this.scene.tweens.add({
      targets: [core1, core2, core3],
      scale: 1.2,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      offset: 300
    });

    // Rotating ring
    const ring = this.scene.add.graphics();
    ring.lineStyle(5, 0xff6b35, 0.8);
    ring.strokeCircle(0, 0, 110);
    ring.strokeCircle(0, 0, 120);

    this.scene.tweens.add({
      targets: ring,
      angle: 360,
      duration: 8000,
      repeat: -1
    });

    // Floating runes/symbols
    const runes = [];
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 / 8) * i;
      const x = Math.cos(angle) * 130;
      const y = Math.sin(angle) * 130;

      const rune = this.scene.add.text(x, y, ['☢', '☣', '⚠', '⚡'][i % 4], {
        fontSize: '24px',
        fill: '#ff6b35'
      });
      rune.setOrigin(0.5);
      runes.push(rune);

      this.scene.tweens.add({
        targets: rune,
        angle: angle + Math.PI / 4,
        duration: 10000,
        repeat: -1
      });
    }

    // Massive energy aura
    const aura1 = this.scene.add.circle(0, 0, 140, 0xff3300, 0.2);
    const aura2 = this.scene.add.circle(0, 0, 160, 0xff6600, 0.15);
    const aura3 = this.scene.add.circle(0, 0, 180, 0xff9900, 0.1);

    this.scene.tweens.add({
      targets: [aura1, aura2, aura3],
      scale: 1.3,
      alpha: 0.05,
      duration: 2000,
      yoyo: true,
      repeat: -1
    });

    // Particle system - intense
    const particles = this.scene.add.particles(0, 0, 'particle', {
      speed: { min: 100, max: 200 },
      scale: { start: 1.5, end: 0 },
      alpha: { start: 1, end: 0 },
      tint: [0xff3300, 0xff6600, 0xff9900, 0xffcc00],
      lifespan: 3000,
      quantity: 5,
      frequency: 50,
      blendMode: 'ADD'
    });

    this.add([aura3, aura2, aura1, body, core1, core2, core3, ring, particles, ...runes]);
  }

  takeDamage(damage) {
    const currentHealth = this.getData('health');
    const newHealth = Math.max(0, currentHealth - damage);
    this.setData('health', newHealth);

    // Flash effect
    this.setAlpha(0.7);
    this.scene.time.delayedCall(100, () => {
      this.setAlpha(1);
    });

    // Update health bar
    const maxHealth = this.getData('maxHealth');
    const healthPercent = newHealth / maxHealth;
    this.healthBar.setScale(healthPercent, 1);

    // Phase transitions
    if (healthPercent <= 0.75 && this.currentPhase === 1) {
      this.enterPhase2();
    } else if (healthPercent <= 0.5 && this.currentPhase === 2) {
      this.enterPhase3();
    } else if (healthPercent <= 0.25 && this.currentPhase === 3) {
      this.enterPhase4();
    }

    // Death
    if (newHealth <= 0) {
      this.die();
    }
  }

  enterPhase2() {
    this.currentPhase = 2;
    this.scene.cameras.main.shake(500, 0.01);
    // Speed up attacks, more aggressive
  }

  enterPhase3() {
    this.currentPhase = 3;
    this.scene.cameras.main.shake(700, 0.015);
    // Even more aggressive
  }

  enterPhase4() {
    this.currentPhase = 4;
    this.scene.cameras.main.shake(1000, 0.02);
    // Final phase - maximum aggression
  }

  die() {
    // Epic death animation
    this.scene.cameras.main.shake(2000, 0.03);

    // Create massive explosion
    for (let i = 0; i < 50; i++) {
      this.scene.time.delayedCall(i * 50, () => {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 150;
        const x = this.x + Math.cos(angle) * distance;
        const y = this.y + Math.sin(angle) * distance;

        this.scene.createExplosion(x, y, 0xff6b35);
      });
    }

    // Boss defeated
    this.scene.socket.emit('bossDefeated', { bossType: this.bossType });

    this.scene.time.delayedCall(2500, () => {
      this.destroy();
      this.dropLoot();
    });
  }

  dropLoot() {
    // Drop legendary items
    // This will be implemented in the item system
  }

  update(time, delta, player) {
    if (!player) return;

    // Boss AI
    const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
    const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);

    // Movement pattern based on boss type
    if (distance > 300) {
      this.physics.velocityFromRotation(angle, 50, this.body.velocity);
    } else {
      this.body.setVelocity(0, 0);
    }

    // Attacks
    if (time > this.lastAttack + 2000 / this.currentPhase) {
      this.attack(player, time);
      this.lastAttack = time;
    }
  }

  attack(player, time) {
    // Boss-specific attacks would go here
    // For now, basic projectile attack
  }
}
