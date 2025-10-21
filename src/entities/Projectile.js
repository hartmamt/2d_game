import Phaser from 'phaser';

export default class Projectile extends Phaser.GameObjects.Container {
  constructor(scene, x, y, angle, characterClass) {
    super(scene, x, y);

    this.scene = scene;
    this.angle = angle;
    this.characterClass = characterClass;

    // Create projectile visual based on character class
    this.createProjectileVisual(characterClass);

    // Add to scene
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Set velocity
    const speed = this.getProjectileSpeed(characterClass);
    this.body.setCircle(this.getProjectileSize(characterClass));
    scene.physics.velocityFromRotation(angle, speed, this.body.velocity);

    // Lifetime
    const lifetime = this.getProjectileLifetime(characterClass);
    scene.time.delayedCall(lifetime, () => {
      if (this.active) {
        this.createImpact();
        this.destroy();
      }
    });

    // Trail effect
    this.createTrail(characterClass);
  }

  getProjectileSpeed(characterClass) {
    const speeds = {
      scavenger: 600,
      forgeguard: 400,
      riftrunner: 700
    };
    return speeds[characterClass] || 500;
  }

  getProjectileSize(characterClass) {
    const sizes = {
      scavenger: 5,
      forgeguard: 10,
      riftrunner: 6
    };
    return sizes[characterClass] || 5;
  }

  getProjectileLifetime(characterClass) {
    const lifetimes = {
      scavenger: 2000,
      forgeguard: 1500,
      riftrunner: 1800
    };
    return lifetimes[characterClass] || 2000;
  }

  createProjectileVisual(characterClass) {
    switch (characterClass) {
      case 'scavenger':
        this.createScavengerProjectile();
        break;
      case 'forgeguard':
        this.createForgeguardProjectile();
        break;
      case 'riftrunner':
        this.createRiftrunnerProjectile();
        break;
      default:
        this.createScavengerProjectile();
    }

    this.setRotation(this.angle);
  }

  createScavengerProjectile() {
    // Rapid-fire bullet
    const projectile = this.scene.add.graphics();

    // Bullet core
    projectile.fillStyle(0x4a9eff, 1);
    projectile.fillEllipse(0, 0, 12, 6);

    // Tracer round tip
    projectile.fillStyle(0x00d4ff, 1);
    projectile.fillEllipse(4, 0, 6, 4);

    // Energy glow
    const glow = this.scene.add.circle(0, 0, 8, 0x4a9eff, 0.5);
    this.scene.tweens.add({
      targets: glow,
      scale: 1.3,
      alpha: 0.2,
      duration: 200,
      yoyo: true,
      repeat: -1
    });

    this.add([glow, projectile]);
  }

  createForgeguardProjectile() {
    // Heavy energy hammer projectile (when thrown or energy wave)
    const projectile = this.scene.add.graphics();

    // Heavy core
    projectile.fillStyle(0xff4a4a, 1);
    projectile.fillCircle(0, 0, 10);

    // Energy rings
    projectile.lineStyle(3, 0xff6b35, 0.8);
    projectile.strokeCircle(0, 0, 12);

    // Inner power
    const core = this.scene.add.circle(0, 0, 6, 0xff6b35);
    this.scene.tweens.add({
      targets: core,
      scale: 1.5,
      alpha: 0.5,
      duration: 300,
      yoyo: true,
      repeat: -1
    });

    // Rotating effect
    this.scene.tweens.add({
      targets: projectile,
      angle: 360,
      duration: 1000,
      repeat: -1
    });

    this.add([projectile, core]);
  }

  createRiftrunnerProjectile() {
    // Rift energy dagger projectile
    const projectile = this.scene.add.graphics();

    // Energy blade
    projectile.fillStyle(0x9d4aff, 1);
    projectile.fillTriangle(10, 0, -10, -5, -10, 5);

    // Edge glow
    projectile.lineStyle(2, 0xdd99ff, 1);
    projectile.lineBetween(10, 0, -10, -5);
    projectile.lineBetween(10, 0, -10, 5);

    // Void energy
    const voidEnergy = this.scene.add.circle(0, 0, 8, 0xff00ff, 0.4);
    this.scene.tweens.add({
      targets: voidEnergy,
      alpha: 0.1,
      scale: 1.4,
      duration: 250,
      yoyo: true,
      repeat: -1
    });

    // Trail sparkles
    const sparkle = this.scene.add.circle(-8, 0, 4, 0xdd99ff, 0.6);
    this.scene.tweens.add({
      targets: sparkle,
      alpha: 0,
      scaleX: 0.5,
      duration: 300,
      repeat: -1
    });

    this.add([voidEnergy, projectile, sparkle]);
  }

  createTrail(characterClass) {
    const colors = {
      scavenger: [0x4a9eff, 0x00d4ff],
      forgeguard: [0xff4a4a, 0xff6b35],
      riftrunner: [0x9d4aff, 0xdd99ff]
    };

    const trailColors = colors[characterClass] || colors.scavenger;

    // Particle trail
    const particles = this.scene.add.particles(0, 0, 'particle', {
      speed: 20,
      scale: { start: 0.4, end: 0 },
      alpha: { start: 0.8, end: 0 },
      tint: trailColors,
      lifespan: 400,
      quantity: 1,
      frequency: 50,
      follow: this
    });

    this.trail = particles;

    // Clean up trail when destroyed
    this.on('destroy', () => {
      if (this.trail) {
        this.trail.stop();
        this.scene.time.delayedCall(500, () => {
          if (this.trail) this.trail.destroy();
        });
      }
    });
  }

  createImpact() {
    const colors = {
      scavenger: 0x4a9eff,
      forgeguard: 0xff4a4a,
      riftrunner: 0x9d4aff
    };

    const color = colors[this.characterClass] || 0xffffff;

    // Impact particles
    const impact = this.scene.add.particles(this.x, this.y, 'particle', {
      speed: { min: 50, max: 150 },
      scale: { start: 0.6, end: 0 },
      alpha: { start: 1, end: 0 },
      tint: color,
      lifespan: 400,
      quantity: 8,
      blendMode: 'ADD'
    });

    this.scene.time.delayedCall(500, () => impact.destroy());
  }

  destroy(fromScene) {
    this.createImpact();
    super.destroy(fromScene);
  }
}
