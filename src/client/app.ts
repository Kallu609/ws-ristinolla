import SocketHandler from './SocketHandler';
import { $, $all } from './elementHelper';
import { IGameData, IPlayer } from '../lib/types';

const statusTextEl = $('.statustext') as HTMLDivElement;
const colsEl = $all('.board > .col') as HTMLDivElement[];

const statusTexts = {
  connecting: ['Yhdistetään', true],
  signin: ['Kerro nimesi'],
  searching: ['Odotetaan pelaajaa', true],
  disconnected: ['Yhteys katkesi'],
};

class App {
  socketHandler: SocketHandler;
  playerList: IGameData;
  playerName: string;
  playerID: string;

  constructor() {
    this.socketHandler = new SocketHandler(this);
    this.setStatusText('connecting');
  }

  setStatusText(type: string): void {
    const text = statusTexts[type][0];

    statusTextEl.innerHTML = text;
  }

  startGame(): void {
    const self = this.playerList.find(x => x.id === this.playerID) as IPlayer;
    const opponent = this.playerList.find(
      x => x.id === self.opponentID
    ) as IPlayer;

    console.log(`Game started against ${opponent.name}`);

    statusTextEl.innerHTML = 'Aloita!';
    setTimeout(() => {
      statusTextEl.innerHTML = '';
    }, 1000);

    Array.from(colsEl).map(col => col.classList.remove('nohover'));
  }

  get playersIngame(): number {
    return this.playerList.filter(x => x.opponentID).length;
  }

  get playersInlobby(): number {
    return this.playerList.filter(x => !x.opponentID).length;
  }

  get playerCount(): number {
    return this.playerList.length;
  }
}

new App();

export default App;
