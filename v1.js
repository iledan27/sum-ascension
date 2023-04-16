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
  var cellWidth = 50;
  var cellHeight = 50;
  var gridX = (this.sys.game.config.width - gridWidth * cellWidth) / 2;
  var gridY = (this.sys.game.config.height - gridHeight * cellHeight) / 2;

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

    button.setInteractive();
    button.on(
      'pointerdown',
      (function (i, buttonText) {
        return function () {
          if (buttonCounters[i] > 0) {
            if (redCellIndex > 0 && values[redCellIndex - 1] === i + 1) {
              cells[redCellIndex].setText(values[redCellIndex].toString());
              redCellIndex--;
              cells[redCellIndex].setText('0');
              redBorder.y -= cellHeight;
            }
            buttonCounters[i]--;
            buttonText.setText(buttonCounters[i].toString());
          } else {
            alert('Button ' + (i + 1) + ' is out of clicks!');
          }
        };
      })(i, buttonText)
    );
  }
}

function update() {}
