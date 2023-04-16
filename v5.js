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
  redCellIndex: 6,
  values: [2, 3, 2, 2, 2, 1, 0],
  cells: [],
  redBorder: null,
  gridX: null,
  gridY: null,
  cellWidth: 50,
  cellHeight: 50,
  selectedNumbers: [],
  sumText: null,
  buttonTexts: [],
  moveButtonCounters: null
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
  var gridWidth = 1;
  var gridHeight = 7;

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
  for (var x = 0; x < gridWidth; x++) {
    for (var y = 0; y < gridHeight; y++) {
      if (y === gridHeight - 1) {
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
        gameState.cells[y] = this.add
          .bitmapText(
            gameState.gridX + x * gameState.cellWidth + gameState.cellWidth / 2,
            gameState.gridY +
              y * gameState.cellHeight +
              gameState.cellHeight / 2,
            'desyrel',
            gameState.values[y].toString(),
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
        gameState.cells[y] = this.add
          .bitmapText(
            gameState.gridX + x * gameState.cellWidth + gameState.cellWidth / 2,
            gameState.gridY +
              y * gameState.cellHeight +
              gameState.cellHeight / 2,
            'desyrel',
            gameState.values[y].toString(),
            32
          )
          .setOrigin(0.5);
      }
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

function onButtonClick(i, buttonText) {
  if (gameState.buttonCounters[i] > 0) {
    if (gameState.selectedNumbers.length === 0) {
      gameState.moveButtonCounters = [...gameState.buttonCounters];
    }

    gameState.selectedNumbers.push(i + 1);
    var sum = gameState.selectedNumbers.reduce((a, b) => a + b, 0);

    gameState.buttonCounters[i]--;
    buttonText.setText(gameState.buttonCounters[i].toString());

    if (
      gameState.redCellIndex > 0 &&
      sum > gameState.values[gameState.redCellIndex - 1]
    ) {
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

      if (
        gameState.redCellIndex > 0 &&
        sum === gameState.values[gameState.redCellIndex - 1]
      ) {
        this.add
          .rectangle(
            gameState.gridX + 0 * gameState.cellWidth + gameState.cellWidth / 2,
            gameState.gridY +
              gameState.redCellIndex * gameState.cellHeight +
              gameState.cellHeight / 2,
            gameState.cellWidth,
            gameState.cellHeight
          )
          .setStrokeStyle(2, 0xffffff);
        gameState.cells[gameState.redCellIndex].setText(
          gameState.values[gameState.redCellIndex].toString()
        );
        gameState.redCellIndex--;
        gameState.cells[gameState.redCellIndex].setText('0');
        gameState.redBorder.y -= gameState.cellHeight;
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
  if (gameState.redCellIndex === 0) {
    alert('You win!');
  }
}

function update() {}
