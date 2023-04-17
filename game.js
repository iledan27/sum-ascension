class Scene extends Phaser.Scene {
  constructor() {
    super({ key: "MyScene" });
  }

  getLevelIndexFromLocalStorage = () => {
    const storedIndex = localStorage.getItem("currentLevelIndex");
    if (storedIndex !== null) {
      return parseInt(storedIndex, 10);
    } else {
      return 0;
    }
  };

  initiateGameState = () => ({
    currentLevelIndex: this.currentLevelIndex,
    buttonCounters: [...this.levels[this.currentLevelIndex].buttonCounters],
    playerIndex: {
      x: 0,
      y: this.levels[this.currentLevelIndex].values.length - 1,
    },
    values: this.levels[this.currentLevelIndex].values,
    cells: [],
    selectCellBorder: null,
    selectedCell: null,
    gridX: null,
    gridY: null,
    cellWidth: null,
    cellHeight: null,
    selectedNumbers: [],
    sumText: null,
    buttonTexts: [],
    moveButtonCounters: null,
    gridWidth: this.levels[this.currentLevelIndex].values[0]?.length,
    gridHeight: this.levels[this.currentLevelIndex].values.length,
    levelTitleText: `Level: 0${this.currentLevelIndex}`,
  });

  preload() {
    this.load.bitmapFont(
      "desyrel",
      "https://labs.phaser.io/assets/fonts/bitmap/desyrel.png",
      "https://labs.phaser.io/assets/fonts/bitmap/desyrel.xml"
    );
    this.load.image("reset-icon", "undo-arrow.png");
    this.load.json("levels", "levels.json");
  }

  create() {
    this.levels = this.cache.json.get("levels");

    this.currentLevelIndex = this.getLevelIndexFromLocalStorage();
    this.gameState = this.initiateGameState();

    const gridSize = Math.max(
      this.gameState.gridWidth,
      this.gameState.gridHeight
    );

    this.gameState.cellWidth = Math.min(
      this.sys.game.config.width / (gridSize * 1.2),
      100
    );
    this.gameState.cellHeight = Math.min(
      (this.sys.game.config.height * (2 / 3)) / (gridSize * 1.2),
      100
    );

    this.gameState.gridX =
      (this.sys.game.config.width -
        this.gameState.gridWidth * this.gameState.cellWidth) /
      2;
    this.gameState.gridY =
      (this.sys.game.config.height * (2 / 3) -
        this.gameState.gridHeight * this.gameState.cellHeight) /
      2;

    this.createGrid(this.gameState.gridWidth, this.gameState.gridHeight);
    this.createButtons();
    this.createResetButton();

    this.gameState.sumText = this.add
      .text(105, 460, "Sum: 0", { fontSize: "32px", fill: "#6bf2f2" })
      .setOrigin(0.5);

    this.gameState.levelTitleText = this.add.text(
      20,
      20,
      `Level: 0${this.gameState.currentLevelIndex + 1}`,
      {
        fontSize: "24px",
        fill: "#ffffff",
      }
    );
  }

  createGrid = (gridWidth, gridHeight) => {
    for (let y = 0; y < gridHeight; y++) {
      this.gameState.cells[y] = [];
      for (let x = 0; x < gridWidth; x++) {
        let cell = this.add
          .rectangle(
            this.gameState.gridX +
              x * this.gameState.cellWidth +
              this.gameState.cellWidth / 2,
            this.gameState.gridY +
              y * this.gameState.cellHeight +
              this.gameState.cellHeight / 2,
            this.gameState.cellWidth,
            this.gameState.cellHeight,
            0x9aaad9
          )
          .setStrokeStyle(2, 0x6bf2f2)
          .setInteractive();

        cell.on("pointerdown", () => this.onSelectCell(x, y));
        this.gameState.cells[y][x] = cell;

        this.add
          .bitmapText(
            this.gameState.gridX +
              x * this.gameState.cellWidth +
              this.gameState.cellWidth / 2,
            this.gameState.gridY +
              y * this.gameState.cellHeight +
              this.gameState.cellHeight / 2,
            "desyrel",
            this.gameState.values[y][x].toString(),
            32
          )
          .setOrigin(0.5);
      }
    }

    this.gameState.cells[0][gridWidth - 1].setFillStyle(0x6bf2f2);
    this.gameState.cells[gridHeight - 1][0].setFillStyle(0x9163bf);
  };

  createButtons = () => {
    this.gameState.buttonCounters.forEach((counter, i) => {
      let button = this.add
        .rectangle(
          100 + i * 150,
          this.sys.game.config.height - 100,
          100,
          100,
          0x9163bf
        )
        .setStrokeStyle(2, 0x9163bf);

      this.add
        .text(
          100 + i * 150,
          this.sys.game.config.height - 100,
          (i + 1).toString(),
          {
            fontSize: "32px",
            fill: "#6bf2f2",
          }
        )
        .setOrigin(0.5);

      let buttonText = this.add.text(
        100 + i * 150,
        this.sys.game.config.height - 200,
        counter.toString(),
        {
          fontSize: "22px",
          fill: "#6bf2f2",
        }
      );
      this.gameState.buttonTexts.push(buttonText);
      button.setInteractive();

      button.on("pointerdown", () => this.onButtonClick(i, buttonText));
    });
  };

  onSelectCell = (x, y) => {
    const { x: playerX, y: playerY } = this.gameState.playerIndex;

    if (
      (x === playerX && (y === playerY - 1 || y === playerY + 1)) ||
      (y === playerY && (x === playerX - 1 || x === playerX + 1))
    ) {
      if (this.gameState.selectCellBorder) {
        this.gameState.selectCellBorder.destroy();
      }

      this.gameState.selectCellBorder = this.add
        .rectangle(
          this.gameState.gridX +
            x * this.gameState.cellWidth +
            this.gameState.cellWidth / 2,
          this.gameState.gridY +
            y * this.gameState.cellHeight +
            this.gameState.cellHeight / 2,
          this.gameState.cellWidth,
          this.gameState.cellHeight
        )
        .setStrokeStyle(2, 0xd955b5);

      this.gameState.selectedCell = { x: x, y: y };

      this.tweens.add({
        targets: this.gameState.selectCellBorder,
        scaleX: 1.1,
        scaleY: 1.1,
        ease: "Sine.easeInOut",
        duration: 500,
        yoyo: true,
        repeat: -1,
      });
    }
  };

  onButtonClick = (i, buttonText) => {
    if (this.gameState.buttonCounters[i] > 0) {
      if (this.gameState.selectedCell) {
        if (this.gameState.selectedNumbers.length === 0) {
          this.gameState.moveButtonCounters = [
            ...this.gameState.buttonCounters,
          ];
        }

        this.gameState.selectedNumbers.push(i + 1);
        let sum = this.gameState.selectedNumbers.reduce((a, b) => a + b, 0);

        this.gameState.buttonCounters[i]--;
        buttonText.setText(this.gameState.buttonCounters[i].toString());

        if (
          sum ===
          this.gameState.values[this.gameState.selectedCell.y][
            this.gameState.selectedCell.x
          ]
        ) {
          this.gameState.cells[this.gameState.playerIndex.y][
            this.gameState.playerIndex.x
          ].setFillStyle(0x9be2f2);
          this.movePlayer();
          this.gameState.selectedNumbers = [];
          this.gameState.sumText.setText("Sum: 0");
        } else if (
          sum >
          this.gameState.values[this.gameState.selectedCell.y][
            this.gameState.selectedCell.x
          ]
        ) {
          this.gameState.selectedNumbers = [];
          sum = 0;
          this.gameState.sumText.setText("Sum: " + sum);
          this.gameState.buttonCounters = [
            ...this.gameState.moveButtonCounters,
          ];
          this.updateButtonText();
          const warningContainer = this.createWarningContainer();

          this.time.delayedCall(
            500,
            function () {
              warningContainer.destroy();
            },
            [],
            this
          );
        } else {
          this.gameState.sumText.setText("Sum: " + sum);
        }
      }
    } else {
      alert(`Button ${i + 1} is out of clicks!`);
    }
  };

  movePlayer = () => {
    this.gameState.playerIndex = { ...this.gameState.selectedCell };

    this.gameState.cells[this.gameState.selectedCell.y][
      this.gameState.selectedCell.x
    ].setFillStyle(0x9163bf);

    this.gameState.selectedCell = null;
    if (this.gameState.selectCellBorder) {
      this.gameState.selectCellBorder.destroy();
    }

    if (
      this.gameState.playerIndex.y === 0 &&
      this.gameState.playerIndex.x === this.gameState.gridWidth - 1
    ) {
      this.showVictoryScreen();
    }
  };

  updateButtonText = () => {
    for (let i = 0; i < this.gameState.buttonCounters.length; i++) {
      this.gameState.buttonTexts[i].setText(
        this.gameState.buttonCounters[i].toString()
      );
    }
  };

  resetLevel = () => {
    this.loadLevel(this.levels[this.gameState.currentLevelIndex]);
    this.scene.restart();
  };

  createResetButton = () => {
    const resetButton = this.add
      .rectangle(this.sys.game.config.width - 50, 30, 36, 36, 0xffffff)
      .setInteractive();

    this.add
      .image(this.sys.game.config.width - 50, 30, "reset-icon")
      .setOrigin(0.5)
      .setDisplaySize(5, 5)
      .setScale(0.5); // Adjust the scale according to the size of your icon

    resetButton.on("pointerdown", () => {
      this.resetLevel();
    });
  };

  loadLevel = (level) => {
    this.gameState.buttonCounters = [...level.buttonCounters];
    this.gameState.values = level.values;
    this.gameState.gridWidth = level.values[0]?.length;
    this.gameState.gridHeight = level.values.length;
    this.gameState.playerIndex = { x: 0, y: this.gameState.gridHeight - 1 };
    this.gameState.selectedNumbers = [];
    this.gameState.sumText = null;
    this.gameState.selectCellBorder = null;
    this.gameState.selectedCell = null;
    this.gameState.buttonTexts = [];
    this.gameState.levelTitleText = `Level: 0${this.gameState.currentLevelIndex}`;
  };

  nextLevel = () => {
    if (this.gameState.currentLevelIndex < this.levels.length - 1) {
      this.updateLevelIndex(this.gameState.currentLevelIndex + 1);
      this.loadLevel(this.levels[this.gameState.currentLevelIndex]);
      this.scene.restart();
    } else {
      this.showGameWonMessage();
    }
  };

  showVictoryScreen = () => {
    const centerX = this.sys.game.config.width / 2;
    const centerY = this.sys.game.config.height / 2;

    const victoryContainer = this.add.container(centerX, centerY).setDepth(1);

    const victoryBackground = this.add.rectangle(0, 0, 300, 200, 0xffffff, 0.8);
    victoryContainer.add(victoryBackground);

    const victoryText = this.add.text(0, -50, "You Win!", {
      fontSize: "32px",
      fill: "#000000",
    });
    victoryText.setOrigin(0.5);
    victoryContainer.add(victoryText);

    const nextLevelButton = this.add.text(0, 20, "Next Level", {
      fontSize: "24px",
      fill: "#000000",
    });
    nextLevelButton.setOrigin(0.5);
    victoryContainer.add(nextLevelButton);

    const buttonBorder = this.add.rectangle(
      0,
      20,
      nextLevelButton.width + 10,
      nextLevelButton.height + 10
    );
    buttonBorder.setStrokeStyle(2, 0x000000);
    buttonBorder.setOrigin(0.5);
    victoryContainer.add(buttonBorder);

    nextLevelButton.setInteractive();
    nextLevelButton.on("pointerdown", () => {
      victoryContainer.destroy();
      this.nextLevel();
    });
  };

  showGameWonMessage = () => {
    const centerX = this.sys.game.config.width / 2;
    const centerY = this.sys.game.config.height / 2;

    const container = this.add.container(centerX, centerY).setDepth(1);
    const background = this.add.rectangle(0, 0, 550, 150, 0xffffff, 0.8);

    const text = this.add
      .text(0, -25, "Congratulations, you won the game!", {
        fontSize: "24px",
        color: "#000000",
        align: "center",
      })
      .setOrigin(0.5);

    const restartButton = this.add
      .text(0, 25, "Restart Game", {
        fontSize: "20px",
        color: "#000000",
        backgroundColor: "#ffffff",
        padding: { left: 10, right: 10, top: 5, bottom: 5 },
      })
      .setOrigin(0.5);

    restartButton.setInteractive({ useHandCursor: true });

    container.add(background);
    container.add(text);
    container.add(restartButton);

    restartButton.on("pointerdown", () => {
      container.destroy();
      this.updateLevelIndex(0);
      this.loadLevel(this.levels[this.gameState.currentLevelIndex]);
      this.scene.restart();
    });
  };

  createWarningContainer = () => {
    const centerX = this.sys.game.config.width / 2;
    const centerY = this.sys.game.config.height / 2;

    const warningContainer = this.add.container(centerX, centerY).setDepth(1);
    const background = this.add.rectangle(0, 0, 450, 100, 0xffa07a, 0.8);
    const warningText = this.add
      .text(0, 0, "Cell value exceeded!", {
        fontSize: "32px",
        fill: "#ff0000",
      })
      .setOrigin(0.5);

    warningContainer.add(background);
    warningContainer.add(warningText);

    return warningContainer;
  };

  updateLevelIndex = (newIndex) => {
    this.gameState.currentLevelIndex = newIndex;
    localStorage.setItem("currentLevelIndex", newIndex);
  };

  update() {}
}

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: Math.min(window.innerHeight, 900),
  scene: [Scene],
};

var game = new Phaser.Game(config);
