import { animate, eventListener, updatePlayerList, setStatusText } from './dom';
import App from './app';
import { IGameData, IPlayer } from '../lib/types';

class Player {
  data: IPlayer;

  constructor(public app: App, public ws: WebSocket) {
    this.handleSocket();
    eventListener(this);
  }

  handleSocket(): void {
    const { ws } = this;

    ws.onopen = () => {
      console.log('Connected to server.');
      setStatusText('signin');
    };

    ws.onclose = () => {
      setStatusText('disconnected');
    };

    ws.onmessage = ev => {
      const { data } = ev;
      this.onMessage(data);
    };
  }

  sendData(...data: any): void {
    if (!data.length) return;
    const json = JSON.stringify(data);
    this.ws.send(json);
  }

  onMessage(data: any): void {
    console.log('Incoming data:', JSON.parse(data));

    const { app } = this;
    const [command, ...args] = JSON.parse(data);

    if (command === 'id') {
      app.playerID = args[0];
    }

    if (command === 'playerlist') {
      app.playerList = args[0] as IGameData;
      this.data = app.getPlayerByID(this.app.playerID) as IPlayer;
      updatePlayerList(this);
    }

    if (command === 'start game') {
      app.startGame();
    }

    if (command === 'challenge from') {
      const challengerID = args[0];
      const challenger = app.getPlayerByID(challengerID);
      if (!challenger) return;

      const accept = confirm(`are u wana fite m8? t. ${challenger.name} ankka`);

      if (accept) {
        this.sendData('challenge accept');
      }

      updatePlayerList(this);
    }
  }

  signin(name: string) {
    this.sendData('signin', name);
    this.app.playerName = name;
  }
}

export default Player;
