import './components/game-over';
import './components/home-screen';
import './components/in-game-ui';
import './components/pause-screen';

import { GameManager } from './game/game-manager';

const gameManager = new GameManager();
gameManager.initGame();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js');
  });
}
