var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

const gameState = {
  buttonCounters: [4, 3, 1],
  redCellIndex: { x: 0, y: 4 },
  values: [
    [2, 3, 2, 1, 1],
    [1, 3, 2, 2, 2],
    [2, 1, 2, 3, 1],
    [3, 3, 3, 2, 1],
    [0, 1, 1, 1, 1]
  ],
  cells: [],
  redBorder: null,
  gridX: null,
  gridY: null,
  cellWidth: 50,
  cellHeight: 50,
  selectedNumbers: [],
  sumText: null,
  buttonTexts: [],
  moveButtonCounters: null,
  gridWidth: 5,
  gridHeight: 5,
  selectedCell: { x: null, y: null, border: null }
};

var game = new Phaser.Game(config);

function preload() {
  this.load.bitmapFont(
    'desyrel',
    'https://labs.phaser.io/assets/fonts/bitmap/desyrel.png',
    'https://labs.phaser.io/assets/fonts/bitmap/desyrel.xml'
  );
}

function create() {
  var gridWidth = gameState.gridWidth;
  var gridHeight = gameState.gridHeight;

  gameState.gridX =
    (this.sys.game.config.width - gridWidth * gameState.cellWidth) / 2;
  gameState.gridY =
    (this.sys.game.config.height - gridHeight * gameState.cellHeight) / 2;

  createGrid.call(this, gridWidth, gridHeight);
  createButtons.call(this);

  gameState.sumText = this.add
    .text(400, 500, 'Sum: 0', { fontSize: '16px', fill: '#fff' })
    .setOrigin(0.5);
}

function createGrid(gridWidth, gridHeight) {
  for (var y = 0; y < gridHeight; y++) {
    gameState.cells[y] = [];
    for (var x = 0; x < gridWidth; x++) {
      if (x === gameState.redCellIndex.x && y === gameState.redCellIndex.y) {
        gameState.redBorder = this.add
          .rectangle(
            gameState.gridX + x * gameState.cellWidth + gameState.cellWidth / 2,
            gameState.gridY +
              y * gameState.cellHeight +
              gameState.cellHeight / 2,
            gameState.cellWidth,
            gameState.cellHeight
          )
          .setStrokeStyle(2, 0xff0000);
        gameState.cells[y][x] = this.add
          .bitmapText(
            gameState.gridX + x * gameState.cellWidth + gameState.cellWidth / 2,
            gameState.gridY +
              y * gameState.cellHeight +
              gameState.cellHeight / 2,
            'desyrel',
            gameState.values[y][x].toString(),
            32
          )
          .setOrigin(0.5);
      } else {
        this.add
          .rectangle(
            gameState.gridX + x * gameState.cellWidth + gameState.cellWidth / 2,
            gameState.gridY +
              y * gameState.cellHeight +
              gameState.cellHeight / 2,
            gameState.cellWidth,
            gameState.cellHeight
          )
          .setStrokeStyle(2, 0xffffff);
        gameState.cells[y][x] = this.add
          .bitmapText(
            gameState.gridX + x * gameState.cellWidth + gameState.cellWidth / 2,
            gameState.gridY +
              y * gameState.cellHeight +
              gameState.cellHeight / 2,
            'desyrel',
            gameState.values[y][x].toString(),
            32
          )
          .setOrigin(0.5);
      }

      gameState.cells[y][x].setInteractive();
      gameState.cells[y][x].on('pointerdown', () =>
        onSelectCell.call(this, x, y)
      );
    }
  }
}

function createButtons() {
  gameState.buttonCounters.forEach((counter, i) => {
    var buttonBorder = this.add
      .rectangle(100 + i * 250, 550, 50, 50)
      .setStrokeStyle(2, 0xffffff);

    var button = this.add
      .text(100 + i * 250, 550, (i + 1).toString(), {
        fontSize: '32px',
        fill: '#fff'
      })
      .setOrigin(0.5);

    var buttonText = this.add.text(100 + i * 250, 500, counter.toString(), {
      fontSize: '16px',
      fill: '#fff'
    });
    gameState.buttonTexts.push(buttonText);
    button.setInteractive();

    button.on('pointerdown', () => onButtonClick.call(this, i, buttonText));
  });
}

function onCellClick(pointer) {
  const x = Math.floor((pointer.x - gameState.gridX) / gameState.cellWidth);
  const y = Math.floor((pointer.y - gameState.gridY) / gameState.cellHeight);

  if (
    Math.abs(gameState.redCellIndex.x - x) +
      Math.abs(gameState.redCellIndex.y - y) >
    1
  ) {
    return;
  }

  if (gameState.selectedCell.border !== null) {
    gameState.selectedCell.border.destroy();
  }

  gameState.selectedCell.x = x;
  gameState.selectedCell.y = y;
  gameState.selectedCell.border = this.add
    .rectangle(
      gameState.gridX + x * gameState.cellWidth + gameState.cellWidth / 2,
      gameState.gridY + y * gameState.cellHeight + gameState.cellHeight / 2,
      gameState.cellWidth,
      gameState.cellHeight
    )
    .setStrokeStyle(2, 0xffff00);
}

function onSelectCell(x, y) {
  if (gameState.yellowBorder) {
    gameState.yellowBorder.destroy();
  }

  gameState.yellowBorder = this.add
    .rectangle(
      gameState.gridX + x * gameState.cellWidth + gameState.cellWidth / 2,
      gameState.gridY + y * gameState.cellHeight + gameState.cellHeight / 2,
      gameState.cellWidth,
      gameState.cellHeight
    )
    .setStrokeStyle(2, 0xffff00);

  gameState.selectedCell = { x: x, y: y };
}

function onButtonClick(i, buttonText) {
  if (gameState.buttonCounters[i] > 0) {
    if (gameState.selectedNumbers.length === 0) {
      gameState.moveButtonCounters = [...gameState.buttonCounters];
    }

    gameState.selectedNumbers.push(i + 1);
    var sum = gameState.selectedNumbers.reduce((a, b) => a + b, 0);

    gameState.buttonCounters[i]--;
    buttonText.setText(gameState.buttonCounters[i].toString());

    const selectedCellValue =
      gameState.values[gameState.selectedCell.y][gameState.selectedCell.x];

    if (sum > selectedCellValue) {
      this.cameras.main.setBackgroundColor(0xffa07a);
      var errorMessage = this.add
        .text(400, 30, 'Error: Sum exceeded!', {
          fontSize: '32px',
          fill: '#ff0000'
        })
        .setOrigin(0.5);

      this.time.delayedCall(
        500,
        function () {
          gameState.selectedNumbers = [];
          sum = 0;
          gameState.sumText.setText('Sum: ' + sum);
          gameState.buttonCounters = [...gameState.moveButtonCounters];
          updateButtonText();
          this.cameras.main.setBackgroundColor(0x000000);
          errorMessage.destroy();
        },
        [],
        this
      );
    } else {
      gameState.sumText.setText('Sum: ' + sum);

      if (sum === selectedCellValue) {
        gameState.cells[gameState.redCellIndex.y][
          gameState.redCellIndex.x
        ].setText(
          gameState.values[gameState.redCellIndex.y][
            gameState.redCellIndex.x
          ].toString()
        );

        gameState.redCellIndex.x = gameState.selectedCell.x;
        gameState.redCellIndex.y = gameState.selectedCell.y;

        gameState.cells[gameState.redCellIndex.y][
          gameState.redCellIndex.x
        ].setText('0');
        gameState.redBorder.x =
          gameState.gridX +
          gameState.redCellIndex.x * gameState.cellWidth +
          gameState.cellWidth / 2;
        gameState.redBorder.y =
          gameState.gridY +
          gameState.redCellIndex.y * gameState.cellHeight +
          gameState.cellHeight / 2;

        gameState.selectedNumbers = [];
        gameState.sumText.setText('Sum: 0');
        checkWin.call(this);
      }
    }
  } else {
    alert(`Button ${i + 1} is out of clicks!`);
  }
}

function updateButtonText() {
  for (var i = 0; i < gameState.buttonCounters.length; i++) {
    gameState.buttonTexts[i].setText(gameState.buttonCounters[i].toString());
  }
}

function checkWin() {
  if (gameState.redCellIndex.x === 0 && gameState.redCellIndex.y === 0) {
    alert('You win!');
  }
}

function update() {}
