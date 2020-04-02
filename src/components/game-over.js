const componentStyles = `
    <style>
        .game-over {
            width: 100%;
            height: 100%;
            display: flex;
            background-color: rgba(0,0,0,0.4);
            flex-direction: column;
            align-items: center;
            font-family: Arial;
            color: white;
        }

        .game-over-text {
            font-size: 42px;
            margin-top: 120px;
        }

        .score-text {
            font-size: 24px;
            margin-top: 20px;
        }

        .retry {
            display: flex;
            align-items: center;
            font-size: 16px;
            margin-top: 35px;
        }

        .tap-text {
            font-size: 16px;
            display: block;
            padding: 10px;
            margin: 25px;
        }
    </style>
`;

export class GameOver extends HTMLElement {
  constructor() {
    super();
    this.root = this.attachShadow({ mode: 'open' });
    this.prop = {
      score: 0,
      onRetry: () => {},
      onResume: () => {}
    };
    this.renderHTML();
    this.bindEvents();
  }

  set score(score) {
    this.prop.score = score;
    this.root.querySelector('#score').innerHTML = `Score: ${score}`;
  }

  set onRetry(onRetry) {
    this.prop.onRetry = onRetry;
  }

  set onResume(onResume) {
    this.prop.onResume = onResume;
  }

  get score() {
    return this.prop.score;
  }

  get onRetry() {
    return this.prop.onRetry;
  }

  get onResume() {
    return this.prop.onResume;
  }

  bindEvents() {
    this.root
      .querySelector('#retry')
      .addEventListener('click', () => this.prop.onRetry());
    this.root
      .querySelector('.tap-text')
      .addEventListener('click', () => this.prop.onResume());
  }

  renderHTML() {
    this.root.innerHTML = `
            ${componentStyles}
            <div class="game-over">
                <span class="game-over-text">
                    Game Over
                </span>
                <span class="score-text" id="score">
                    Score: 0
                </span>
                <span class="retry" id="retry">
                    <img src="assets/images/return.png" alt="Retry" height="32">&nbsp;
                    Retry
                </span>
                <span class="tap-text">
                    Tap to continue
                </span>
            </div>
        `;
  }

  static get observedAttributes() {
    return ['onResume', 'onRetry', 'score'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case 'score':
        this.score = newValue;
        break;
      case 'onResume':
        this.onResume = newValue;
        break;
      case 'onRetry':
        this.onRetry = newValue;
        break;
    }
  }
}

customElements.define('game-over', GameOver);
