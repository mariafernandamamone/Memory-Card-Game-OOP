/**
 * Represents an individual color card on the memory game grid.
 * Encapsulates its DOM element, visual state, and Drag & Drop event bindings.
 */
export default class Box {
  /**
   * @param {string} color - The CSS color assigned to this card.
   * @param {Object} game - Reference to the parent Game controller instance.
   * @param {boolean} [isMatched=false] - Whether the card is already matched (e.g., restored from storage).
   */
  constructor(color, game, isMatched = false) {
    this.color = color;
    this.game = game;
    this.isMatched = isMatched;
    this.element = this.createElement();
  }

  /**
   * Creates the card DOM element, restores matched state if needed, and binds Drag & Drop listeners.
   * @returns {HTMLDivElement} The configured card element.
   */
  createElement() {
    const card = document.createElement('div');
    card.classList.add('memory-card');
    card.dataset.color = this.color;
    card.draggable = true;
    this.element = card;

    if (this.isMatched) {
      this.markAsMatched();
    }

    // Reveal color and notify game when dragging starts
    card.addEventListener('dragstart', () => {
      if (this.isMatched) return;
      this.reveal();
      this.game.handleDragStart(this);
    });

    // Allow drop and highlight target card on dragover
    card.addEventListener('dragover', (event) => {
      event.preventDefault();
      if (!this.isMatched) {
        card.classList.add('drag-over');
      }
    });

    // Remove highlight when dragged card leaves target area
    card.addEventListener('dragleave', () => {
      card.classList.remove('drag-over');
    });

    // Clear highlight and delegate match evaluation to Game on drop
    card.addEventListener('drop', (event) => {
      event.preventDefault();
      card.classList.remove('drag-over');
      this.game.handleDrop(this);
    });

    // Notify game if drag ends outside a valid drop target
    card.addEventListener('dragend', () => {
      this.game.handleDragEnd(this);
    });

    return card;
  }

  /**
   * Reveals the card's assigned background color.
   */
  reveal() {
    this.element.style.backgroundColor = this.color;
  }

  /**
   * Hides the card's color, reverting to the default card back style.
   */
  hide() {
    this.element.style.backgroundColor = '';
  }

  /**
   * Locks the card as matched, disables further dragging, and keeps its color visible.
   */
  markAsMatched() {
    this.isMatched = true;
    this.element.classList.add('matched');
    this.element.draggable = false;
    this.reveal();
  }
}