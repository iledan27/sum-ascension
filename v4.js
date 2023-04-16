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

var game = new Phaser.Game(config);

var buttonCounters = [4, 3, 1];

var redCellIndex = 6;

var values = [2, 3, 2, 2, 2, 1, 0];

var cells = [];

var redBorder;

var gridX;
var gridY;

var cellWidth = 50;
var cellHeight = 50;

var selectedNumbers = [];

var sumText;
var buttonTexts = [];

var moveButtonCounters = [...buttonCounters];

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

  gridX = (this.sys.game.config.width - gridWidth * cellWidth) / 2;
  gridY = (this.sys.game.config.height - gridHeight * cellHeight) / 2;

  createGrid.call(this, gridWidth, gridHeight);
  createButtons.call(this);

  sumText = this.add
    .text(400, 500, 'Sum: 0', { fontSize: '16px', fill: '#fff' })
    .setOrigin(0.5);
}

function createGrid(gridWidth, gridHeight) {
  for (var x = 0; x < gridWidth; x++) {
    for (var y = 0; y < gridHeight; y++) {
      if (y === gridHeight - 1) {
        redBorder = this.add
          .rectangle(
            gridX + x * cellWidth + cellWidth / 2,
            gridY + y * cellHeight + cellHeight / 2,
            cellWidth,
            cellHeight
          )
          .setStrokeStyle(2, 0xff0000);

        cells[y] = this.add
          .bitmapText(
            gridX + x * cellWidth + cellWidth / 2,
            gridY + y * cellHeight + cellHeight / 2,
            'desyrel',
            values[y].toString(),
            32
          )
          .setOrigin(0.5);
      } else {
        this.add
          .rectangle(
            gridX + x * cellWidth + cellWidth / 2,
            gridY + y * cellHeight + cellHeight / 2,
            cellWidth,
            cellHeight
          )
          .setStrokeStyle(2, 0xffffff);

        cells[y] = this.add
          .bitmapText(
            gridX + x * cellWidth + cellWidth / 2,
            gridY + y * cellHeight + cellHeight / 2,
            'desyrel',
            values[y].toString(),
            32
          )
          .setOrigin(0.5);
      }
    }
  }
}

function createButtons() {
  for (var i = 0; i < buttonCounters.length; i++) {
    var buttonBorder = this.add
      .rectangle(100 + i * 250, 550, 50, 50)
      .setStrokeStyle(2, 0xffffff);

    var button = this.add
      .text(100 + i * 250, 550, (i + 1).toString(), {
        fontSize: '32px',
        fill: '#fff'
      })
      .setOrigin(0.5);

    var buttonText = this.add.text(
      100 + i * 250,
      500,
      buttonCounters[i].toString(),
      { fontSize: '16px', fill: '#fff' }
    );
    buttonTexts.push(buttonText);
    button.setInteractive();

    button.on('pointerdown', onButtonClick.bind(this, i, buttonText));
  }
}

function onButtonClick(i, buttonText) {
  if (buttonCounters[i] > 0) {
    if (selectedNumbers.length === 0) {
      moveButtonCounters = [...buttonCounters];
    }

    selectedNumbers.push(i + 1);
    var sum = selectedNumbers.reduce((a, b) => a + b, 0);

    if (redCellIndex > 0 && sum > values[redCellIndex - 1]) {
      selectedNumbers = [];
      sum = 0;
      sumText.setText('Sum: ' + sum);
      buttonCounters = [...moveButtonCounters];
      updateButtonText();
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
          this.cameras.main.setBackgroundColor(0x000000);
          errorMessage.destroy();
        },
        [],
        this
      );
    } else {
      sumText.setText('Sum: ' + sum);
      if (redCellIndex > 0 && sum === values[redCellIndex - 1]) {
        this.add
          .rectangle(
            gridX + 0 * cellWidth + cellWidth / 2,
            gridY + redCellIndex * cellHeight + cellHeight / 2,
            cellWidth,
            cellHeight
          )
          .setStrokeStyle(2, 0xffffff);
        cells[redCellIndex].setText(values[redCellIndex].toString());
        redCellIndex--;
        cells[redCellIndex].setText('0');
        redBorder.y -= cellHeight;
        selectedNumbers = [];
        sumText.setText('Sum: 0');
        checkWin.call(this);
      }
      buttonCounters[i]--;
      buttonText.setText(buttonCounters[i].toString());
    }
  } else {
    alert('Button ' + (i + 1) + ' is out of clicks!');
  }
}

function updateButtonText() {
  for (var i = 0; i < buttonCounters.length; i++) {
    buttonTexts[i].setText(buttonCounters[i].toString());
  }
}

function checkWin() {
  if (redCellIndex === 0) {
    alert('You win!');
  }
}

function update() {}
