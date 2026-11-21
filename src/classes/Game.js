import Box from "./Box.js";

/**
 * Controls the Memory Card Game flow, board state, timer,
 * Drag & Drop match evaluation, and localStorage persistence.
 */
export default class Game {
  constructor() {
    // DOM Elements
    this.pairsCounter = document.getElementById("pairsCounter");
    this.timerDisplay = document.getElementById("timerDisplay");
    this.memoryGrid = document.getElementById("memoryGrid");
    this.winMessage = document.getElementById("winMessage");
    this.resetBtn = document.getElementById("resetBtn");

    // Game State
    this.totalPairs = 15;
    this.matchedPairs = 0;
    this.seconds = 0;
    this.timerInterval = null;
    this.draggedBox = null;
    this.boxes = [];

    // Bind reset button and initialize game
    this.resetBtn.addEventListener("click", () => this.resetGame());
    this.loadGame();
  }

  /**
   * Returns a curated palette of 15 visually distinct colors for the matching pairs.
   * @returns {string[]} Array of hexadecimal color strings.
   */
  generateColors() {
    return [
      "#e92e1a",
      "#cfaaee",
      "#04d15a",
      "#f1c40f",
      "#902db7",
      "#e67e22",
      "#4a448f",
      "#2f0be3",
      "#198b8a",
      "#34495e",
      "#8c600e",
      "#5f0785",
      "#4fa7eb",
      "#095714",
      "#f41383",
    ];
  }

  /**
   * Starts the elapsed time counter on the first card interaction.
   */
  startTimer() {
    if (!this.timerInterval) {
      this.timerInterval = setInterval(() => {
        this.seconds++;
        this.timerDisplay.textContent = `Time: ${this.seconds}s`;
        this.saveGame();
      }, 1000);
    }
  }

  /**
   * Serializes the current board state, matched pairs, and elapsed time into localStorage.
   */
  saveGame() {
    const cardsData = this.boxes.map((box) => ({
      color: box.color,
      matched: box.isMatched,
    }));

    const gameState = {
      seconds: this.seconds,
      matchedPairs: this.matchedPairs,
      cards: cardsData,
    };

    localStorage.setItem("memoryGameState", JSON.stringify(gameState));
  }

  /**
   * Generates a new shuffled deck of Box instances, renders the 6x5 grid, and saves initial state.
   */
  initGame() {
    this.memoryGrid.innerHTML = "";
    this.boxes = [];

    // Duplicate generated colors to form matching pairs
    const baseColors = this.generateColors(this.totalPairs);
    const cardsArray = [...baseColors, ...baseColors];

    // Shuffle cards randomly
    cardsArray.sort(() => Math.random() - 0.5);

    // Create a Box instance for each color and append to grid
    cardsArray.forEach((color) => {
      const box = new Box(color, this);
      this.boxes.push(box);
      this.memoryGrid.appendChild(box.element);
    });

    this.saveGame();
  }

  /**
   * Restores saved game progress from localStorage or starts a fresh game if none exists.
   */
  loadGame() {
    const savedData = localStorage.getItem("memoryGameState");
    if (!savedData) {
      this.initGame();
      return;
    }

    const gameState = JSON.parse(savedData);
    this.seconds = gameState.seconds;
    this.matchedPairs = gameState.matchedPairs;
    this.timerDisplay.textContent = `Time: ${this.seconds}s`;
    this.pairsCounter.textContent = `Pairs: ${this.matchedPairs} / ${this.totalPairs}`;

    // Restore victory message if a completed game was saved
    if (this.matchedPairs === this.totalPairs) {
      clearInterval(this.timerInterval);
      this.winMessage.textContent = `Congratulations! You found all pairs in ${this.seconds} seconds.`;
    }

    // Rebuild grid from saved card states
    this.memoryGrid.innerHTML = "";
    this.boxes = [];

    gameState.cards.forEach((cardData) => {
      const box = new Box(cardData.color, this, cardData.matched);
      this.boxes.push(box);
      this.memoryGrid.appendChild(box.element);
    });
  }

  /**
   * Clears active timers, resets counters and storage, and starts a brand-new round.
   */
  resetGame() {
    clearInterval(this.timerInterval);
    this.timerInterval = null;
    this.seconds = 0;
    this.matchedPairs = 0;
    this.draggedBox = null;

    this.timerDisplay.textContent = "Time: 0s";
    this.pairsCounter.textContent = `Pairs: 0 / ${this.totalPairs}`;
    this.winMessage.textContent = "";

    localStorage.removeItem("memoryGameState");
    this.initGame();
  }

  /**
   * Starts the game timer on the first interaction and stores the dragged card reference.
   * @param {Box} box - The Box instance being dragged.
   */
  handleDragStart(box) {
    this.startTimer();
    this.draggedBox = box;
  }

  /**
   * Evaluates whether the dragged card matches the target drop card.
   * Locks both cards on match or hides them after a short delay on mismatch.
   * @param {Box} targetBox - The Box instance where the card was dropped.
   */
  handleDrop(targetBox) {
    // Ignore drops onto itself, invalid drags, or already matched cards
    if (
      !this.draggedBox ||
      this.draggedBox === targetBox ||
      targetBox.isMatched
    ) {
      return;
    }

    targetBox.reveal();

    if (this.draggedBox.color === targetBox.color) {
      // Match found: lock both cards and clear dragged reference
      this.draggedBox.markAsMatched();
      targetBox.markAsMatched();
      this.draggedBox = null;

      // Update pair counter and persist state
      this.matchedPairs++;
      this.pairsCounter.textContent = `Pairs: ${this.matchedPairs} / ${this.totalPairs}`;
      this.saveGame();

      // Check for game completion
      if (this.matchedPairs === this.totalPairs) {
        clearInterval(this.timerInterval);
        this.winMessage.textContent = `Congratulations! You found all pairs in ${this.seconds} seconds.`;
      }
    } else {
      // Mismatch: temporarily store references and hide both cards after 700ms
      const firstBox = this.draggedBox;
      const secondBox = targetBox;
      this.draggedBox = null;

      setTimeout(() => {
        firstBox.hide();
        secondBox.hide();
      }, 700);
    }
  }

  /**
   * Hides the dragged card if dropped outside a valid target without matching.
   * @param {Box} box - The Box instance whose drag operation ended.
   */
  handleDragEnd(box) {
    if (!box.isMatched && this.draggedBox === box) {
      box.hide();
      this.draggedBox = null;
    }
  }
}
