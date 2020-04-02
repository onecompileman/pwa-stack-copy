const componentStyles = `
    <style>
        .in-game-ui {
            width: calc(100%-20px);
            height: 50px;
            display: flex;
            justify-content: space-between;
            font-family: Arial;
            color: white;
            font-size: 24px;
            padding: 10px;
        }
    </style>
`;

export class InGameUI extends HTMLElement {
  constructor() {
    super();
    this.root = this.attachShadow({ mode: 'open' });
    this.prop = {
      onPause: () => {},
      score: 0
    };
    this.renderHTML();
    this.bindEvents();
  }

  set score(score) {
    this.prop.score = score;
    this.root.querySelector('#score').innerHTML = score;
  }

  set onPause(onPause) {
    this.prop.onPause = onPause;
  }

  get score() {
    return this.prop.score;
  }

  get onPause() {
    return this.prop.onPause;
  }

  bindEvents() {
    this.root
      .querySelector('img')
      .addEventListener('click', () => this.prop.onPause());
  }

  renderHTML() {
    this.root.innerHTML = `
        ${componentStyles}
        <div class="in-game-ui">
            <img src="assets/images/pause.png" height="32">
            <span class="score" id="score">
                0
            </span>
        </div>
        `;
  }

  static get observedAttributes() {
    return ['score', 'onPause'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case 'score':
        this.score = newValue;
        break;
      case 'onPause':
        this.onPause = newValue;
        break;
    }
  }
}

customElements.define('in-game-ui', InGameUI);
