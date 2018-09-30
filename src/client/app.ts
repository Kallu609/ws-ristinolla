import Player from './player';
import { IGameData, IPlayer } from '../lib/types';
import { webSocketPort } from '../../config';
import { setStatusText, enableBoard } from './dom';

class App {
  ws: WebSocket;
  player: Player;
  playerList: IGameData = [];
  playerName: string;
  playerID: string;

  constructor() {
    this.ws = new WebSocket(`ws://localhost:${webSocketPort}`);
    this.player = new Player(this, this.ws);
    setStatusText('connecting');
  }

  startGame(): void {
    const self = this.playerList.find(x => x.id === this.playerID) as IPlayer;
    const opponent = this.getPlayerByID(self.opponentID);
    if (!opponent) return;
    enableBoard();

    console.log(`Game started against ${opponent.name}`);
  }

  getPlayerByID(id: string): IPlayer | undefined {
    const player = this.playerList.find(x => x.id === id);
    return player || undefined;
  }

  get playersInGame(): number {
    return this.playerList.filter(x => x.opponentID).length;
  }

  get playersInLobby(): number {
    return this.playerList.filter(x => !x.opponentID).length;
  }

  get playerCount(): number {
    return this.playerList.length;
  }
}

new App();

export default App;
