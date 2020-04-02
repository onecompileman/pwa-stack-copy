const componentStyles = `
    <style>
        .pause {
            height: 100%;
            width: 100%;
            background-color: rgba(0,0,0,0.4);
            display: flex;
            flex-direction: column;
            align-items: center;
            font-family: Arial;
            color: white;
        }

        .pause-text {
            font-size: 42px;
            margin-top: 150px;
        }

        .tap-text {
            font-size: 16px;
            margin-top: 40px;
        }
    </style>
`;

export class PauseScreen extends HTMLElement {
  constructor() {
    super();
    this.root = this.attachShadow({ mode: 'open' });
    this.prop = {
      onResume: () => {}
    };
    this.renderHTML();
    this.bindEvents();
  }

  set onResume(onResume) {
    this.prop.onResume = onResume;
  }

  get onResume() {
    return this.prop.onResume;
  }

  bindEvents() {
    this.root
      .querySelector('.pause')
      .addEventListener('click', () => this.prop.onResume());
  }

  renderHTML() {
    this.root.innerHTML = `
        ${componentStyles}
        <div class="pause">
            <span class="pause-text">
                Game is Paused
            </span>
            <span class="tap-text">
                Tap to resume
            </span>
        </div>
      `;
  }

  static get observedAttributes() {
    return ['onResume'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case 'onResume':
        this.onResume = newValue;
        break;
    }
  }
}

customElements.define('pause-screen', PauseScreen);
