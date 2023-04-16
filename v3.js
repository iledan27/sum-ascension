// Game configuration
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

// Create a new Phaser game with the specified configuration
var game = new Phaser.Game(config);

// Button counters
var buttonCounters = [4, 3, 1];
// Index of the red cell in the grid
var redCellIndex = 6;
// Values of the cells in the grid
var values = [2, 3, 2, 2, 2, 1, 0];
// Array of cell objects
var cells = [];
// Red border object
var redBorder;
// X and Y coordinates of the top-left corner of the grid
var gridX;
var gridY;
// Width and height of each cell in the grid
var cellWidth = 50;
var cellHeight = 50;
// Array of selected numbers
var selectedNumbers = [];
// Sum text object
var sumText;

// Preload function - called before the game starts
function preload() {
  // Load a bitmap font
  this.load.bitmapFont(
    'desyrel',
    'https://labs.phaser.io/assets/fonts/bitmap/desyrel.png',
    'https://labs.phaser.io/assets/fonts/bitmap/desyrel.xml'
  );
}

// Create function - called when the game starts
function create() {
  // Grid dimensions (in cells)
  var gridWidth = 1;
  var gridHeight = 7;

  // Calculate the X and Y coordinates of the top-left corner of the grid
  gridX = (this.sys.game.config.width - gridWidth * cellWidth) / 2;
  gridY = (this.sys.game.config.height - gridHeight * cellHeight) / 2;

  // Create the grid and buttons
  createGrid.call(this, gridWidth, gridHeight);
  createButtons.call(this);
  // Create the sum text object
  sumText = this.add
    .text(400, 500, 'Sum: 0', { fontSize: '16px', fill: '#fff' })
    .setOrigin(0.5);
}

// Function to create the grid
function createGrid(gridWidth, gridHeight) {
  // Loop through each cell in the grid
  for (var x = 0; x < gridWidth; x++) {
    for (var y = 0; y < gridHeight; y++) {
      // If this is the bottom cell in the column...
      if (y === gridHeight - 1) {
        // ...create a red border around it...
        redBorder = this.add
          .rectangle(
            gridX + x * cellWidth + cellWidth / 2,
            gridY + y * cellHeight + cellHeight / 2,
            cellWidth,
            cellHeight
          )
          .setStrokeStyle(2, 0xff0000);
        // ...and add its value to the `cells` array.
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
        // Otherwise, create a white border around it...
        this.add
          .rectangle(
            gridX + x * cellWidth + cellWidth / 2,
            gridY + y * cellHeight + cellHeight / 2,
            cellWidth,
            cellHeight
          )
          .setStrokeStyle(2, 0xffffff);
        // ...and add its value to the `cells` array.
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

// Function to create the buttons
function createButtons() {
  // Loop through each button counter...
  for (var i = 0; i < buttonCounters.length; i++) {
    // ...and create a white border around it...
    var buttonBorder = this.add
      .rectangle(100 + i * 250, 550, 50, 50)
      .setStrokeStyle(2, 0xffffff);
    // ...create a text object with its value...
    var button = this.add
      .text(100 + i * 250, 550, (i + 1).toString(), {
        fontSize: '32px',
        fill: '#fff'
      })
      .setOrigin(0.5);
    // ...create a text object with its counter value...
    var buttonText = this.add.text(
      100 + i * 250,
      500,
      buttonCounters[i].toString(),
      { fontSize: '16px', fill: '#fff' }
    );
    // ...and make it interactive.
    button.setInteractive();
    // When the button is clicked...
    button.on('pointerdown', onButtonClick.bind(this, i, buttonText));
  }
}

// Function to handle button clicks
function onButtonClick(i, buttonText) {
  // If the button still has clicks remaining...
  if (buttonCounters[i] > 0) {
    // ...add its value to the `selectedNumbers` array...
    selectedNumbers.push(i + 1);
    // ...calculate the sum of the selected numbers...
    var sum = selectedNumbers.reduce((a, b) => a + b, 0);
    // ...and update the `sumText` object.
    sumText.setText('Sum: ' + sum);
    // If the red cell is not at the top of the column and the sum matches the value of the cell above it...
    if (redCellIndex > 0 && sum === values[redCellIndex - 1]) {
      // ...move the red cell up one position...
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
      // ...reset the `selectedNumbers` array and `sumText` object...
      selectedNumbers = [];
      sumText.setText('Sum: 0');
      // ...and check if the player has won.
      checkWin.call(this);
    }
    // Decrease the button's counter by 1...
    buttonCounters[i]--;
    // ...and update its text.
    buttonText.setText(buttonCounters[i].toString());
  } else {
    // If the button is out of clicks, display an alert.
    alert('Button ' + (i + 1) + ' is out of clicks!');
  }
}

// Function to check if the player has won
function checkWin() {
  // If the red cell has reached the top of the column...
  if (redCellIndex === 0) {
    // ...display a winning message.
    alert('You win!');
  }
}

// Update function - called on every frame
function update() {}
