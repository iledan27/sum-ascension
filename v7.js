// Define game configuration object
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload, // Function that will preload assets before the game starts
    create: create, // Function that will create the game world
    update: update // Function that will update the game state
  }
};

// Define game state object
const gameState = {
  buttonCounters: [5, 3, 1], // Array of button click counters
  redCellIndex: { x: 0, y: 4 }, // Index of red cell in the grid
  values: [
    // 2D array of cell values
    [2, 3, 2, 2, 1],
    [1, 2, 1, 3, 2],
    [2, 2, 2, 1, 3],
    [3, 1, 3, 2, 2],
    [0, 2, 3, 1, 1]
  ],
  cells: [], // Array of cell objects
  redBorder: null, // Reference to red cell's border
  yellowBorder: null, // Reference to yellow cell's border
  selectedCell: null, // Reference to currently selected cell
  gridX: null, // X position of the grid in the game world
  gridY: null, // Y position of the grid in the game world
  cellWidth: 50, // Width of each cell in the grid
  cellHeight: 50, // Height of each cell in the grid
  selectedNumbers: [], // Array of selected button values
  sumText: null, // Reference to sum text object
  buttonTexts: [], // Array of button text objects
  moveButtonCounters: null, // Copy of buttonCounters for use during a move
  gridWidth: 5, // Width of the grid
  gridHeight: 5 // Height of the grid
};

// Create game object with configuration object
var game = new Phaser.Game(config);

// Preload function to load assets
function preload() {
  this.load.bitmapFont(
    'desyrel',
    'https://labs.phaser.io/assets/fonts/bitmap/desyrel.png',
    'https://labs.phaser.io/assets/fonts/bitmap/desyrel.xml'
  );
}

// Create function to set up game world
function create() {
  // Calculate grid position in the game world
  gameState.gridX =
    (this.sys.game.config.width - gameState.gridWidth * gameState.cellWidth) /
    2;
  gameState.gridY =
    (this.sys.game.config.height -
      gameState.gridHeight * gameState.cellHeight) /
    2;

  // Create the grid of cells
  createGrid.call(this, gameState.gridWidth, gameState.gridHeight);

  // Create the buttons
  createButtons.call(this);

  // Create the sum text object
  gameState.sumText = this.add
    .text(400, 460, 'Sum: 0', { fontSize: '16px', fill: '#6bf2f2' })
    .setOrigin(0.5);
}

// Function to create the grid of cells
function createGrid(gridWidth, gridHeight) {
  for (let y = 0; y < gridHeight; y++) {
    gameState.cells[y] = [];
    for (let x = 0; x < gridWidth; x++) {
      // Add interactivity to the cells
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

      // When a cell is clicked, call the onSelectCell function with its coordinates
      cell.on('pointerdown', () => onSelectCell.call(this, x, y));
      gameState.cells[y][x] = cell;

      this.add
        .bitmapText(
          gameState.gridX + x * gameState.cellWidth + gameState.cellWidth / 2,
          gameState.gridY + y * gameState.cellHeight + gameState.cellHeight / 2,
          'desyrel',
          gameState.values[y][x].toString(),
          32
        )
        .setOrigin(0.5);
    }
  }

  gameState.redBorder = this.add.rectangle(
    gameState.gridX +
      gameState.redCellIndex.x * gameState.cellWidth +
      gameState.cellWidth / 2,
    gameState.gridY +
      gameState.redCellIndex.y * gameState.cellHeight +
      gameState.cellHeight / 2,
    gameState.cellWidth,
    gameState.cellHeight
  );

  gameState.cells[0][gridWidth - 1].setFillStyle(0x6bf2f2);
  gameState.cells[gridHeight - 1][0].setFillStyle(0x9163bf);
}

// Function to create the buttons
function createButtons() {
  gameState.buttonCounters.forEach((counter, i) => {
    // Create the button border
    let button = this.add
      .rectangle(100 + i * 250, 550, 50, 50, 0x9163bf)
      .setStrokeStyle(2, 0x9163bf);

    // Create the button text and add it to the buttonTexts array
    this.add
      .text(100 + i * 250, 550, (i + 1).toString(), {
        fontSize: '32px',
        fill: '#6bf2f2'
      })
      .setOrigin(0.5);

    let buttonText = this.add.text(100 + i * 250, 500, counter.toString(), {
      fontSize: '16px',
      fill: '#6bf2f2'
    });
    gameState.buttonTexts.push(buttonText);
    button.setInteractive();

    // When a button is clicked, call the onButtonClick function with its index and its text object
    button.on('pointerdown', () => onButtonClick.call(this, i, buttonText));
  });
}

// Function called when a cell is selected
function onSelectCell(x, y) {
  const { x: redX, y: redY } = gameState.redCellIndex;

  // Check if the clicked cell is a valid neighbor (up, down, left, or right)
  if (
    (x === redX && (y === redY - 1 || y === redY + 1)) ||
    (y === redY && (x === redX - 1 || x === redX + 1))
  ) {
    // If there is already a yellow border, remove it
    if (gameState.yellowBorder) {
      gameState.yellowBorder.destroy();
    }

    // Create a new yellow border around the selected cell
    gameState.yellowBorder = this.add
      .rectangle(
        gameState.gridX + x * gameState.cellWidth + gameState.cellWidth / 2,
        gameState.gridY + y * gameState.cellHeight + gameState.cellHeight / 2,
        gameState.cellWidth,
        gameState.cellHeight
      )
      .setStrokeStyle(2, 0xd955b5);

    // Set the selected cell to be the newly selected cell
    gameState.selectedCell = { x: x, y: y };

    // Add the pulse animation to the yellow border
    this.tweens.add({
      targets: gameState.yellowBorder,
      scaleX: 1.1,
      scaleY: 1.1,
      ease: 'Sine.easeInOut',
      duration: 500,
      yoyo: true,
      repeat: -1
    });
  }
}

// Function called when a button is clicked
function onButtonClick(i, buttonText) {
  // If the button has clicks left
  if (gameState.buttonCounters[i] > 0) {
    // If a cell is selected
    if (gameState.selectedCell) {
      // If no numbers have been selected yet, make a copy of the button counters and store them in gameState.moveButtonCounters
      if (gameState.selectedNumbers.length === 0) {
        gameState.moveButtonCounters = [...gameState.buttonCounters];
      }

      // Add the value of the button to the selectedNumbers array and calculate the new sum
      gameState.selectedNumbers.push(i + 1);
      let sum = gameState.selectedNumbers.reduce((a, b) => a + b, 0);

      // Decrement the button counter and update its text
      gameState.buttonCounters[i]--;
      buttonText.setText(gameState.buttonCounters[i].toString());

      // If the sum of the selected numbers equals the value of the selected cell, move the red cell and reset the selectedNumbers array and sum text
      if (
        sum ===
        gameState.values[gameState.selectedCell.y][gameState.selectedCell.x]
      ) {
        gameState.cells[gameState.redCellIndex.y][
          gameState.redCellIndex.x
        ].setFillStyle(0x9be2f2);
        moveRedCell.call(this);
        gameState.selectedNumbers = [];
        gameState.sumText.setText('Sum: 0');
        // If the sum is greater than the value of the selected cell, reset the selectedNumbers array, sum text, and button counters to their original values
      } else if (
        sum >
        gameState.values[gameState.selectedCell.y][gameState.selectedCell.x]
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
        // If the sum is less than the value of the selected cell, update the sum text
      } else {
        gameState.sumText.setText('Sum: ' + sum);
      }
    }
  } else {
    alert(`Button ${i + 1} is out of clicks!`);
  }
}

// Function called to move the red cell
function moveRedCell() {
  // Update the red cell index to the selected cell's index
  gameState.redCellIndex = { ...gameState.selectedCell };

  // Otherwise, move the red cell to the selected cell position
  gameState.redBorder.x =
    gameState.gridX +
    gameState.redCellIndex.x * gameState.cellWidth +
    gameState.cellWidth / 2;
  gameState.redBorder.y =
    gameState.gridY +
    gameState.redCellIndex.y * gameState.cellHeight +
    gameState.cellHeight / 2;

  gameState.cells[gameState.selectedCell.y][
    gameState.selectedCell.x
  ].setFillStyle(0x9163bf);

  // Reset the selected cell
  gameState.selectedCell = null;
  gameState.yellowBorder.destroy();

  // If the red cell has reached the top of the grid, the player has won
  if (
    gameState.redCellIndex.y === 0 &&
    gameState.redCellIndex.x === gameState.gridWidth - 1
  ) {
    alert('You win!');
  }
}

// Function called to update the button text after a button has been clicked
function updateButtonText() {
  for (let i = 0; i < gameState.buttonCounters.length; i++) {
    gameState.buttonTexts[i].setText(gameState.buttonCounters[i].toString());
  }
}

// Empty update function, as we're not using it in this game
function update() {}
