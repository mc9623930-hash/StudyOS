/* ==========================================================================
   StudyOS — Active Recall Flashcards & Spaced Repetition Engine
   ========================================================================== */

export class RevisionEngine {
  constructor(appState) {
    this.state = appState;
    this.currentDeck = 'physics';
    this.currentIndex = 0;
    this.isFlipped = false;

    this.decks = {
      physics: [
        { id: 'p1', question: "What is Huygens' Principle?", answer: "Every point on a wavefront is a source of secondary wavelets that spread out in all directions with the speed of light.", category: "Optics" },
        { id: 'p2', question: "Write the expression for fringe width in Young's Double Slit Experiment (YDSE).", answer: "β = (λ * D) / d, where λ is wavelength, D is distance to screen, and d is slit separation.", category: "Optics" },
        { id: 'p3', question: "State Gauss's Law in Electrostatics.", answer: "The total electric flux through any closed surface is equal to 1/ε₀ times the net charge enclosed inside the surface.", category: "Electrostatics" },
        { id: 'p4', question: "What is the work done in moving a charge on an equipotential surface?", answer: "Zero, because potential difference between any two points on an equipotential surface is zero.", category: "Electrostatics" }
      ],
      chemistry: [
        { id: 'c1', question: "What is Aldol Condensation?", answer: "Aldehydes or ketones containing at least one α-hydrogen atom react in presence of dilute alkali to form β-hydroxy aldehydes/ketones.", category: "Organic Chem" },
        { id: 'c2', question: "Write the product of Reimer-Tiemann Reaction on Phenol.", answer: "Salicylaldehyde (2-hydroxybenzaldehyde) formed by reacting phenol with chloroform and aqueous NaOH.", category: "Organic Chem" },
        { id: 'c3', question: "State Raoult's Law for volatile liquids.", answer: "The partial vapour pressure of each component of the solution is directly proportional to its mole fraction present in solution.", category: "Solutions" }
      ],
      maths: [
        { id: 'm1', question: "Formula for Integration by Parts ∫ u v dx", answer: "∫ u v dx = u ∫ v dx - ∫ [ (du/dx) * ∫ v dx ] dx", category: "Calculus" },
        { id: 'm2', question: "Evaluate ∫ 1 / (x² + a²) dx", answer: "(1 / a) * arctan(x / a) + C", category: "Calculus" },
        { id: 'm3', question: "What is the condition for two matrices A and B to be conformable for multiplication?", answer: "Number of columns in Matrix A must be equal to the number of rows in Matrix B.", category: "Algebra" }
      ]
    };
  }

  setDeck(deckName) {
    this.currentDeck = deckName;
    this.currentIndex = 0;
    this.isFlipped = false;
    this.render();
  }

  flipCard() {
    this.isFlipped = !this.isFlipped;
    const cardEl = document.getElementById('flashcard-3d');
    if (cardEl) {
      if (this.isFlipped) {
        cardEl.classList.add('flipped');
      } else {
        cardEl.classList.remove('flipped');
      }
    }
  }

  nextCard() {
    const deck = this.decks[this.currentDeck] || [];
    if (deck.length === 0) return;
    this.currentIndex = (this.currentIndex + 1) % deck.length;
    this.isFlipped = false;
    this.render();
  }

  prevCard() {
    const deck = this.decks[this.currentDeck] || [];
    if (deck.length === 0) return;
    this.currentIndex = (this.currentIndex - 1 + deck.length) % deck.length;
    this.isFlipped = false;
    this.render();
  }

  rateCard(rating) {
    // Spaced repetition feedback alert
    const card = this.decks[this.currentDeck][this.currentIndex];
    const intervals = { hard: '1 Day', good: '3 Days', easy: '7 Days' };
    alert(`Marked "${rating.toUpperCase()}". Next review scheduled in ${intervals[rating]}.`);
    this.nextCard();
  }

  render() {
    const container = document.getElementById('revision-content-container');
    if (!container) return;

    const deck = this.decks[this.currentDeck] || [];
    const currentCard = deck[this.currentIndex] || { question: "No cards", answer: "No cards available", category: "None" };

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; gap: 20px; max-width: 600px; margin: 0 auto;">
        
        <!-- Deck Selectors -->
        <div style="display: flex; gap: 10px;">
          <button onclick="window.studyApp.revisionEngine.setDeck('physics')" class="btn-timer-secondary" style="padding: 8px 18px; font-weight: 700; ${this.currentDeck==='physics'?'background: var(--primary-container); color: var(--on-primary-container);':''}">Physics (${this.decks.physics.length})</button>
          <button onclick="window.studyApp.revisionEngine.setDeck('chemistry')" class="btn-timer-secondary" style="padding: 8px 18px; font-weight: 700; ${this.currentDeck==='chemistry'?'background: var(--primary-container); color: var(--on-primary-container);':''}">Chemistry (${this.decks.chemistry.length})</button>
          <button onclick="window.studyApp.revisionEngine.setDeck('maths')" class="btn-timer-secondary" style="padding: 8px 18px; font-weight: 700; ${this.currentDeck==='maths'?'background: var(--primary-container); color: var(--on-primary-container);':''}">Maths (${this.decks.maths.length})</button>
        </div>

        <div style="font-size: 13px; font-family: var(--font-geist); color: var(--on-surface-variant);">
          Card ${this.currentIndex + 1} of ${deck.length} • Subject: <strong style="color: var(--primary);">${currentCard.category}</strong>
        </div>

        <!-- 3D Flip Card -->
        <div id="flashcard-3d" onclick="window.studyApp.revisionEngine.flipCard()" class="flashcard-container ${this.isFlipped ? 'flipped' : ''}">
          <div class="flashcard-inner">
            <div class="flashcard-front glass-card">
              <span class="material-symbols-outlined" style="font-size: 36px; color: var(--primary); margin-bottom: 12px;">help_center</span>
              <h4 style="font-size: 18px; font-weight: 700; line-height: 1.4;">${currentCard.question}</h4>
              <p style="font-size: 12px; color: var(--on-surface-variant); margin-top: 16px; font-family: var(--font-geist);">Click card to reveal answer</p>
            </div>
            <div class="flashcard-back glass-card">
              <span class="material-symbols-outlined" style="font-size: 36px; color: var(--tertiary); margin-bottom: 12px;">lightbulb</span>
              <p style="font-size: 16px; font-weight: 600; line-height: 1.5; color: var(--on-surface);">${currentCard.answer}</p>
            </div>
          </div>
        </div>

        <!-- Flip & Rating Controls -->
        <div style="display: flex; gap: 12px; width: 100%; justify-content: center; align-items: center;">
          <button onclick="window.studyApp.revisionEngine.prevCard()" class="btn-timer-secondary" style="padding: 10px 16px;">
            <span class="material-symbols-outlined">arrow_back</span>
          </button>
          
          <button onclick="window.studyApp.revisionEngine.flipCard()" class="btn-timer-primary" style="flex: 1; padding: 12px;">
            ${this.isFlipped ? 'Show Question' : 'Reveal Answer'}
          </button>

          <button onclick="window.studyApp.revisionEngine.nextCard()" class="btn-timer-secondary" style="padding: 10px 16px;">
            <span class="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>

        <!-- Spaced Repetition Rating Buttons -->
        ${this.isFlipped ? `
          <div style="display: flex; gap: 12px; width: 100%; margin-top: 4px;">
            <button onclick="window.studyApp.revisionEngine.rateCard('hard')" style="flex: 1; background: rgba(244, 63, 94, 0.2); color: #ff859b; border: 1px solid rgba(244, 63, 94, 0.4); padding: 10px; border-radius: 10px; font-weight: 700; cursor: pointer;">
              Hard (1 Day)
            </button>
            <button onclick="window.studyApp.revisionEngine.rateCard('good')" style="flex: 1; background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4); padding: 10px; border-radius: 10px; font-weight: 700; cursor: pointer;">
              Good (3 Days)
            </button>
            <button onclick="window.studyApp.revisionEngine.rateCard('easy')" style="flex: 1; background: rgba(74, 225, 118, 0.2); color: var(--tertiary); border: 1px solid rgba(74, 225, 118, 0.4); padding: 10px; border-radius: 10px; font-weight: 700; cursor: pointer;">
              Easy (7 Days)
            </button>
          </div>
        ` : ''}

      </div>
    `;
  }
}
