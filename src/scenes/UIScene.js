import Phaser from 'phaser';

export default class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene' });
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Background panel
    const panel = this.add.graphics();
    panel.fillStyle(0x000000, 0.7);
    panel.fillRect(10, 10, 300, 120);
    panel.lineStyle(2, 0xff6b35, 0.8);
    panel.strokeRect(10, 10, 300, 120);

    // Health bar
    this.healthLabel = this.add.text(20, 20, 'HEALTH', {
      fontSize: '16px',
      fill: '#ffffff',
      fontFamily: 'Courier New',
      fontStyle: 'bold'
    });

    this.healthBarBg = this.add.graphics();
    this.healthBarBg.fillStyle(0x333333, 1);
    this.healthBarBg.fillRect(20, 45, 280, 20);

    this.healthBar = this.add.graphics();

    this.healthText = this.add.text(160, 55, '100 / 100', {
      fontSize: '14px',
      fill: '#ffffff',
      fontFamily: 'Courier New',
      fontStyle: 'bold'
    });
    this.healthText.setOrigin(0.5);

    // Zone info
    this.zoneText = this.add.text(20, 75, 'ZONE: 1', {
      fontSize: '16px',
      fill: '#ff6b35',
      fontFamily: 'Courier New',
      fontStyle: 'bold'
    });

    // Score
    this.scoreText = this.add.text(20, 95, 'SCORE: 0', {
      fontSize: '14px',
      fill: '#ffaa66',
      fontFamily: 'Courier New'
    });

    this.scrapText = this.add.text(150, 95, 'SCRAP: 0', {
      fontSize: '14px',
      fill: '#66ff66',
      fontFamily: 'Courier New'
    });

    // Timeline loops indicator (top right)
    this.loopPanel = this.add.graphics();
    this.loopPanel.fillStyle(0x000000, 0.7);
    this.loopPanel.fillRect(width - 210, 10, 200, 60);
    this.loopPanel.lineStyle(2, 0x9d4aff, 0.8);
    this.loopPanel.strokeRect(width - 210, 10, 200, 60);

    this.loopText = this.add.text(width - 110, 25, 'Timeline Loop: 0', {
      fontSize: '14px',
      fill: '#9d4aff',
      fontFamily: 'Courier New',
      fontStyle: 'bold'
    });
    this.loopText.setOrigin(0.5);

    this.multiplierText = this.add.text(width - 110, 45, 'Multiplier: x1.0', {
      fontSize: '14px',
      fill: '#dd99ff',
      fontFamily: 'Courier New'
    });
    this.multiplierText.setOrigin(0.5);

    // Controls hint (bottom)
    const controls = this.add.text(width / 2, height - 30,
      'WASD: Move | MOUSE: Aim & Shoot | ESC: Menu', {
      fontSize: '12px',
      fill: '#888888',
      fontFamily: 'Courier New'
    });
    controls.setOrigin(0.5);
  }

  updateUI(data) {
    if (!data) return;

    // Update health bar
    const healthPercent = data.health / data.maxHealth;
    this.healthBar.clear();

    if (healthPercent > 0.6) {
      this.healthBar.fillStyle(0x00ff00, 1);
    } else if (healthPercent > 0.3) {
      this.healthBar.fillStyle(0xffaa00, 1);
    } else {
      this.healthBar.fillStyle(0xff0000, 1);
    }

    this.healthBar.fillRect(20, 45, 280 * healthPercent, 20);

    this.healthText.setText(`${Math.max(0, Math.floor(data.health))} / ${data.maxHealth}`);

    // Update zone
    this.zoneText.setText(`ZONE: ${data.zone}`);

    // Update score and scrap
    this.scoreText.setText(`SCORE: ${data.score}`);
    this.scrapText.setText(`SCRAP: ${data.scrap}`);

    // Update timeline loops
    if (data.timelineLoops > 0) {
      this.loopText.setText(`Timeline Loop: ${data.timelineLoops}`);
      const multiplier = 1 + (data.timelineLoops * 0.5);
      this.multiplierText.setText(`Multiplier: x${multiplier.toFixed(1)}`);
    } else {
      this.loopText.setText('Timeline Loop: 0');
      this.multiplierText.setText('Multiplier: x1.0');
    }
  }
}
