const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

const level1 = {
  buttonCounters: [4, 3, 1],
  values: [[2], [3], [2], [2], [2], [1], [0]],
};

const level2 = {
  buttonCounters: [5, 3, 1],
  values: [
    [2, 3, 2, 2, 1],
    [1, 2, 1, 3, 2],
    [2, 2, 2, 1, 3],
    [3, 1, 3, 2, 2],
    [0, 2, 3, 1, 1],
  ],
};

const level7 = {
  buttonCounters: [7, 6, 3],
  values: [
    [3, 3, 2, 2, 6, 5],
    [5, 1, 5, 1, 1, 1],
    [1, 6, 6, 2, 2, 2],
    [2, 2, 4, 4, 4, 4],
    [6, 5, 1, 1, 6, 5],
    [0, 4, 5, 6, 5, 4],
  ],
};

const level9 = {
  buttonCounters: [4, 3, 2],
  values: [
    [1, 1, 2, 1, 6],
    [2, 1, 2, 2, 2],
    [1, 2, 1, 1, 1],
    [3, 3, 3, 3, 3],
    [0, 1, 2, 1, 2],
  ],
};

function generateLevel(
  gridWidth,
  gridHeight,
  minButtonValue,
  maxButtonValue,
  buttonCounters
) {
  const level = {
    buttonCounters: buttonCounters,
    values: [],
  };

  for (let y = 0; y < gridHeight; y++) {
    level.values[y] = [];
    for (let x = 0; x < gridWidth; x++) {
      if (x === 0 && y === gridHeight - 1) {
        level.values[y][x] = 0;
      } else {
        level.values[y][x] =
          Math.floor(Math.random() * (maxButtonValue - minButtonValue + 1)) +
          minButtonValue;
      }
    }
  }

  return level;
}

const level = level7;

const gameState = {
  buttonCounters: [...level.buttonCounters],
  playerIndex: { x: 0, y: level.values.length - 1 },
  values: level.values,
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
  gridWidth: level.values[0]?.length,
  gridHeight: level.values.length,
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
    50
  );
  gameState.cellHeight = Math.min(
    (this.sys.game.config.height * (2 / 3)) / (gridSize * 1.2),
    50
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
    .text(105, 460, "Sum: 0", { fontSize: "16px", fill: "#6bf2f2" })
    .setOrigin(0.5);
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
      .rectangle(100 + i * 100, 550, 50, 50, 0x9163bf)
      .setStrokeStyle(2, 0x9163bf);

    this.add
      .text(100 + i * 100, 550, (i + 1).toString(), {
        fontSize: "32px",
        fill: "#6bf2f2",
      })
      .setOrigin(0.5);

    let buttonText = this.add.text(100 + i * 100, 500, counter.toString(), {
      fontSize: "16px",
      fill: "#6bf2f2",
    });
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
        this.cameras.main.setBackgroundColor(0xffa07a);
        var errorMessage = this.add
          .text(400, 30, "Error: Sum exceeded!", {
            fontSize: "32px",
            fill: "#ff0000",
          })
          .setOrigin(0.5);

        this.time.delayedCall(
          500,
          function () {
            gameState.selectedNumbers = [];
            sum = 0;
            gameState.sumText.setText("Sum: " + sum);
            gameState.buttonCounters = [...gameState.moveButtonCounters];
            updateButtonText();
            this.cameras.main.setBackgroundColor(0x000000);
            errorMessage.destroy();
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
  gameState.selectCellBorder.destroy();

  if (
    gameState.playerIndex.y === 0 &&
    gameState.playerIndex.x === gameState.gridWidth - 1
  ) {
    alert("You win!");
  }
}

function updateButtonText() {
  for (let i = 0; i < gameState.buttonCounters.length; i++) {
    gameState.buttonTexts[i].setText(gameState.buttonCounters[i].toString());
  }
}

function resetGame() {
  gameState.buttonCounters = [...level.buttonCounters];
  updateButtonText();

  gameState.playerIndex = { x: 0, y: level.values.length - 1 };
  gameState.values = level.values;

  createGrid.call(this, gameState.gridWidth, gameState.gridHeight);

  gameState.selectedNumbers = [];
  gameState.sumText.setText("Sum: 0");
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
    resetGame.call(this);
  });
}

function update() {}
