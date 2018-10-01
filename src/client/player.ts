import {
  eventListener,
  updatePlayerList,
  setStatusText,
  showChallenge,
} from './dom';
import App from './app';
import { IGameData, IPlayer } from '../lib/types';
import { webSocketPort } from '../../config';

class Player {
  ws: WebSocket;
  data: IPlayer;
  name: string;
  id: string;
  opponentID: string;

  constructor(public app: App) {
    this.ws = new WebSocket(`ws://localhost:${webSocketPort}`);
    this.ws.onopen = this.onOpen;
    eventListener(this);
  }

  onOpen = (): void => {
    const { ws } = this;

    console.log('Connected to server.');
    setStatusText('signin');

    ws.onmessage = ev => {
      const { data } = ev;
      this.onMessage(data);
    };

    ws.onclose = () => {
      setStatusText('disconnected');
    };
  };

  onMessage(data: any): void {
    console.log('Incoming data:', JSON.parse(data));

    const { app } = this;
    const [command, ...args] = JSON.parse(data);

    if (command === 'id') {
      this.id = args[0];
    }

    if (command === 'playerlist') {
      app.playerList = args[0] as IGameData;

      if (this.id) {
        const self = app.getPlayerByID(this.id) as IPlayer;

        if (self && self.opponentID) {
          this.opponentID = self.opponentID;
        }
      }

      updatePlayerList(this);
    }

    if (command === 'start game') {
      app.startGame();
    }

    if (command === 'challenge from') {
      const challengerID = args[0];
      const challenger = app.getPlayerByID(challengerID);
      if (!challenger) return;

      showChallenge(challenger.name);

      updatePlayerList(this);
    }
  }

  sendData(...data: any[]): void {
    if (!data.length) return;
    const json = JSON.stringify(data);
    this.ws.send(json);
  }

  signin(name: string) {
    this.sendData('signin', name);
    this.name = name;
  }
}

export default Player;
