export class ScreenManager {
  constructor() {
    this.screens = {};

    this.screens.gameOver = document.querySelector('game-over');
    this.screens.homeScreen = document.querySelector('home-screen');
    this.screens.inGameUI = document.querySelector('in-game-ui');
    this.screens.pauseScreen = document.querySelector('pause-screen');
  }

  hideAllScreen() {
    Object.keys(this.screens).forEach(screen => {
      this.screens[screen].style.display = 'none';
    });
  }

  show(screenName) {
    this.hideAllScreen();
    this.screens[screenName].style.display = 'block';
  }
}
