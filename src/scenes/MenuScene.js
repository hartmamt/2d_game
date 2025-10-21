import Phaser from 'phaser';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x0a0a0a);

    // Title
    const title = this.add.text(width / 2, 100, 'ASHEN CORE', {
      fontSize: '72px',
      fill: '#ff6b35',
      fontStyle: 'bold',
      fontFamily: 'Courier New'
    });
    title.setOrigin(0.5);

    // Subtitle
    const subtitle = this.add.text(width / 2, 160, 'Survival on a dying alien moon', {
      fontSize: '20px',
      fill: '#ff9966',
      fontFamily: 'Courier New'
    });
    subtitle.setOrigin(0.5);

    // Character selection
    this.selectedCharacter = 'scavenger';

    const charY = 280;
    const chars = [
      {
        key: 'scavenger',
        name: 'The Scavenger',
        desc: 'Balanced Marksman\nRapid-fire, high mobility',
        color: 0x4a9eff
      },
      {
        key: 'forgeguard',
        name: 'The Forgeguard',
        desc: 'Tanky Bruiser\nHeavy melee, damage resistance',
        color: 0xff4a4a
      },
      {
        key: 'riftrunner',
        name: 'The Riftrunner',
        desc: 'Agile Assassin\nSpeed, evasion, teleport',
        color: 0x9d4aff
      }
    ];

    this.characterBoxes = [];

    chars.forEach((char, i) => {
      const x = width / 2 - 300 + i * 300;
      const box = this.add.rectangle(x, charY + 80, 260, 200, char.color, 0.2);
      box.setStrokeStyle(3, char.color);
      box.setInteractive();
      box.setData('character', char.key);

      const name = this.add.text(x, charY, char.name, {
        fontSize: '20px',
        fill: '#ffffff',
        fontFamily: 'Courier New',
        fontStyle: 'bold'
      });
      name.setOrigin(0.5);

      const desc = this.add.text(x, charY + 80, char.desc, {
        fontSize: '14px',
        fill: '#cccccc',
        fontFamily: 'Courier New',
        align: 'center'
      });
      desc.setOrigin(0.5);

      box.on('pointerover', () => {
        box.setFillStyle(char.color, 0.4);
      });

      box.on('pointerout', () => {
        if (this.selectedCharacter !== char.key) {
          box.setFillStyle(char.color, 0.2);
        }
      });

      box.on('pointerdown', () => {
        this.characterBoxes.forEach(b => {
          const c = chars.find(ch => ch.key === b.getData('character'));
          b.setFillStyle(c.color, 0.2);
        });
        box.setFillStyle(char.color, 0.6);
        this.selectedCharacter = char.key;
      });

      this.characterBoxes.push(box);
    });

    // Set default selection
    this.characterBoxes[0].setFillStyle(chars[0].color, 0.6);

    // Player name input
    const nameLabel = this.add.text(width / 2, 520, 'Player Name:', {
      fontSize: '18px',
      fill: '#ffffff',
      fontFamily: 'Courier New'
    });
    nameLabel.setOrigin(0.5);

    this.playerName = 'Player';

    // Start button
    const startButton = this.add.rectangle(width / 2, 600, 200, 50, 0xff6b35);
    startButton.setStrokeStyle(2, 0xffffff);
    startButton.setInteractive();

    const startText = this.add.text(width / 2, 600, 'START GAME', {
      fontSize: '20px',
      fill: '#ffffff',
      fontFamily: 'Courier New',
      fontStyle: 'bold'
    });
    startText.setOrigin(0.5);

    startButton.on('pointerover', () => {
      startButton.setFillStyle(0xff8c5a);
    });

    startButton.on('pointerout', () => {
      startButton.setFillStyle(0xff6b35);
    });

    startButton.on('pointerdown', () => {
      this.scene.start('GameScene', {
        playerName: this.playerName,
        characterClass: this.selectedCharacter
      });
    });
  }
}
