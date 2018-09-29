import SocketHandler from './SocketHandler';
import { $, $all } from './elementHelper';

const guideTextEl = $('.guide-text') as HTMLDivElement;
const colsEl = $all('.board > .col') as HTMLDivElement[];

const statusTexts = {
  connecting: ['Yhdistetään', true],
  signin: ['Kerro nimesi'],
  searching: ['Odotetaan pelaajaa', true],
};

class App {
  socketHandler: SocketHandler;
  playerName: string;
  playerID: string;

  constructor() {
    this.socketHandler = new SocketHandler(this);
    this.setStatusText('connecting');
  }

  setStatusText(type: string): void {
    const text = statusTexts[type][0];

    guideTextEl.innerHTML = text;
  }

  startGame(): void {
    Array.from(colsEl).map(col => col.classList.remove('nohover'));
  }
}

new App();

export default App;
