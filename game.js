const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: Math.min(window.innerHeight, 900),
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

const levels = [
  {
    buttonCounters: [4, 3, 1],
    values: [[2], [3], [2], [2], [2], [1], [0]],
  },
  {
    buttonCounters: [5, 3, 1],
    values: [
      [2, 3, 2, 2, 1],
      [1, 2, 1, 3, 2],
      [2, 2, 2, 1, 3],
      [3, 1, 3, 2, 2],
      [0, 2, 3, 1, 1],
    ],
  },
];

function getLevelIndexFromLocalStorage() {
  const storedIndex = localStorage.getItem("currentLevelIndex");
  if (storedIndex !== null) {
    return parseInt(storedIndex, 10);
  } else {
    return 0; // Default level index if not found in localStorage
  }
}

const gameState = {
  currentLevelIndex: getLevelIndexFromLocalStorage(),
  buttonCounters: [...levels[getLevelIndexFromLocalStorage()].buttonCounters],
  playerIndex: {
    x: 0,
    y: levels[getLevelIndexFromLocalStorage()].values.length - 1,
  },
  values: levels[getLevelIndexFromLocalStorage()].values,
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
  gridWidth: levels[getLevelIndexFromLocalStorage()].values[0]?.length,
  gridHeight: levels[getLevelIndexFromLocalStorage()].values.length,
  levelTitleText: `Level: 0${getLevelIndexFromLocalStorage()}`,
};

var game = new Phaser.Game(config);

function preload() {
  this.load.bitmapFont(
    "desyrel",
    "https://labs.phaser.io/assets/fonts/bitmap/desyrel.png",
    "https://labs.phaser.io/assets/fonts/bitmap/desyrel.xml"
  );
  this.load.image("reset-icon", "undo-arrow.png");
}

function create() {
  const gridSize = Math.max(gameState.gridWidth, gameState.gridHeight);

  gameState.cellWidth = Math.min(
    this.sys.game.config.width / (gridSize * 1.2),
    100
  );
  gameState.cellHeight = Math.min(
    (this.sys.game.config.height * (2 / 3)) / (gridSize * 1.2),
    100
  );

  gameState.gridX =
    (this.sys.game.config.width - gameState.gridWidth * gameState.cellWidth) /
    2;
  gameState.gridY =
    (this.sys.game.config.height * (2 / 3) -
      gameState.gridHeight * gameState.cellHeight) /
    2;

  createGrid.call(this, gameState.gridWidth, gameState.gridHeight);
  createButtons.call(this);
  createResetButton.call(this);

  gameState.sumText = this.add
    .text(105, 460, "Sum: 0", { fontSize: "32px", fill: "#6bf2f2" })
    .setOrigin(0.5);

  gameState.levelTitleText = this.add.text(
    20,
    20,
    `Level: 0${gameState.currentLevelIndex + 1}`,
    {
      fontSize: "24px",
      fill: "#ffffff",
    }
  );
}

function createGrid(gridWidth, gridHeight) {
  for (let y = 0; y < gridHeight; y++) {
    gameState.cells[y] = [];
    for (let x = 0; x < gridWidth; x++) {
      let cell = this.add
        .rectangle(
          gameState.gridX + x * gameState.cellWidth + gameState.cellWidth / 2,
          gameState.gridY + y * gameState.cellHeight + gameState.cellHeight / 2,
          gameState.cellWidth,
          gameState.cellHeight,
          0x9aaad9
        )
        .setStrokeStyle(2, 0x6bf2f2)
        .setInteractive();

      cell.on("pointerdown", () => onSelectCell.call(this, x, y));
      gameState.cells[y][x] = cell;

      this.add
        .bitmapText(
          gameState.gridX + x * gameState.cellWidth + gameState.cellWidth / 2,
          gameState.gridY + y * gameState.cellHeight + gameState.cellHeight / 2,
          "desyrel",
          gameState.values[y][x].toString(),
          32
        )
        .setOrigin(0.5);
    }
  }

  gameState.cells[0][gridWidth - 1].setFillStyle(0x6bf2f2);
  gameState.cells[gridHeight - 1][0].setFillStyle(0x9163bf);
}

function createButtons() {
  gameState.buttonCounters.forEach((counter, i) => {
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
    gameState.buttonTexts.push(buttonText);
    button.setInteractive();

    button.on("pointerdown", () => onButtonClick.call(this, i, buttonText));
  });
}

function onSelectCell(x, y) {
  const { x: playerX, y: playerY } = gameState.playerIndex;

  if (
    (x === playerX && (y === playerY - 1 || y === playerY + 1)) ||
    (y === playerY && (x === playerX - 1 || x === playerX + 1))
  ) {
    if (gameState.selectCellBorder) {
      gameState.selectCellBorder.destroy();
    }

    gameState.selectCellBorder = this.add
      .rectangle(
        gameState.gridX + x * gameState.cellWidth + gameState.cellWidth / 2,
        gameState.gridY + y * gameState.cellHeight + gameState.cellHeight / 2,
        gameState.cellWidth,
        gameState.cellHeight
      )
      .setStrokeStyle(2, 0xd955b5);

    gameState.selectedCell = { x: x, y: y };

    this.tweens.add({
      targets: gameState.selectCellBorder,
      scaleX: 1.1,
      scaleY: 1.1,
      ease: "Sine.easeInOut",
      duration: 500,
      yoyo: true,
      repeat: -1,
    });
  }
}

function onButtonClick(i, buttonText) {
  if (gameState.buttonCounters[i] > 0) {
    if (gameState.selectedCell) {
      if (gameState.selectedNumbers.length === 0) {
        gameState.moveButtonCounters = [...gameState.buttonCounters];
      }

      gameState.selectedNumbers.push(i + 1);
      let sum = gameState.selectedNumbers.reduce((a, b) => a + b, 0);

      gameState.buttonCounters[i]--;
      buttonText.setText(gameState.buttonCounters[i].toString());

      if (
        sum ===
        gameState.values[gameState.selectedCell.y][gameState.selectedCell.x]
      ) {
        gameState.cells[gameState.playerIndex.y][
          gameState.playerIndex.x
        ].setFillStyle(0x9be2f2);
        movePlayer.call(this);
        gameState.selectedNumbers = [];
        gameState.sumText.setText("Sum: 0");
      } else if (
        sum >
        gameState.values[gameState.selectedCell.y][gameState.selectedCell.x]
      ) {
        gameState.selectedNumbers = [];
        sum = 0;
        gameState.sumText.setText("Sum: " + sum);
        gameState.buttonCounters = [...gameState.moveButtonCounters];
        updateButtonText();
        const warningContainer = createWarningContainer.call(this);

        this.time.delayedCall(
          500,
          function () {
            warningContainer.destroy();
          },
          [],
          this
        );
      } else {
        gameState.sumText.setText("Sum: " + sum);
      }
    }
  } else {
    alert(`Button ${i + 1} is out of clicks!`);
  }
}

function movePlayer() {
  gameState.playerIndex = { ...gameState.selectedCell };

  gameState.cells[gameState.selectedCell.y][
    gameState.selectedCell.x
  ].setFillStyle(0x9163bf);

  gameState.selectedCell = null;
  if (gameState.selectCellBorder) {
    gameState.selectCellBorder.destroy();
  }

  if (
    gameState.playerIndex.y === 0 &&
    gameState.playerIndex.x === gameState.gridWidth - 1
  ) {
    showVictoryScreen.call(this);
  }
}

function updateButtonText() {
  for (let i = 0; i < gameState.buttonCounters.length; i++) {
    gameState.buttonTexts[i].setText(gameState.buttonCounters[i].toString());
  }
}

function resetLevel() {
  loadLevel(levels[gameState.currentLevelIndex]);
  this.scene.restart();
}

function createResetButton() {
  const resetButton = this.add
    .rectangle(this.sys.game.config.width - 50, 30, 36, 36, 0xffffff)
    .setInteractive();

  this.add
    .image(this.sys.game.config.width - 50, 30, "reset-icon")
    .setOrigin(0.5)
    .setDisplaySize(5, 5)
    .setScale(0.5); // Adjust the scale according to the size of your icon

  resetButton.on("pointerdown", () => {
    resetLevel.call(this);
  });
}

function loadLevel(level) {
  gameState.buttonCounters = [...level.buttonCounters];
  gameState.values = level.values;
  gameState.gridWidth = level.values[0]?.length;
  gameState.gridHeight = level.values.length;
  gameState.playerIndex = { x: 0, y: gameState.gridHeight - 1 };
  gameState.selectedNumbers = [];
  gameState.sumText = null;
  gameState.selectCellBorder = null;
  gameState.selectedCell = null;
  gameState.buttonTexts = [];
  gameState.levelTitleText = `Level: 0${gameState.currentLevelIndex}`;
}

function nextLevel() {
  if (gameState.currentLevelIndex < levels.length - 1) {
    updateLevelIndex(gameState.currentLevelIndex + 1);
    loadLevel(levels[gameState.currentLevelIndex]);
    this.scene.restart();
  } else {
    showGameWonMessage.call(this);
  }
}

function showVictoryScreen() {
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
    nextLevel.call(this);
  });
}

function showGameWonMessage() {
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
    updateLevelIndex(0);
    loadLevel(levels[gameState.currentLevelIndex]);
    this.scene.restart();
  });
}

function createWarningContainer() {
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
}

function updateLevelIndex(newIndex) {
  gameState.currentLevelIndex = newIndex;
  localStorage.setItem("currentLevelIndex", newIndex);
}

function update() {}
