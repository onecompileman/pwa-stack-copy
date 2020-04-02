const componentStyles = `
    <style>
        .home-screen {
            background-color: rgba(0,0,0,0.2);
            font-family: Arial;
            display: flex;
            flex-direction: column;
            align-items: center;
            color: white;
            width: 100%;
            height: 100%;
        }

        .game-title {
            font-size: 42px;
            margin-top: 120px;
        }

        .creator {
            font-size: 14px;
            margin-top: 20px;
        }

        .tap-to-play {
            margin-top: 100px;
            font-size: 24px;
            font-style: italic;
        }
    </style>
`;

export class HomeScreen extends HTMLElement {
  constructor() {
    super();
    this.root = this.attachShadow({ mode: 'open' });
    this.prop = {
      onTap: () => {}
    };
    this.renderHTML();
    this.bindEvents();
  }

  set onTap(onTap) {
    this.prop.onTap = onTap;
  }

  get onTap() {
    return this.prop.onTap;
  }

  renderHTML() {
    this.root.innerHTML = `
            ${componentStyles}
            <div class="home-screen">
                <span class="game-title">
                    Stack mo to
                </span>
                <span class="creator">
                    Created by: Stephen Vinuya
                </span>

                <span class="tap-to-play">
                    Tap to Play
                </span>
            </div>
        `;
  }

  bindEvents() {
    this.root
      .querySelector('.home-screen')
      .addEventListener('click', () => this.prop.onTap());
  }

  static get observedAttributes() {
    return ['onTap'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case 'onTap':
        this.onTap = newValue;
        break;
    }
  }
}

customElements.define('home-screen', HomeScreen);
