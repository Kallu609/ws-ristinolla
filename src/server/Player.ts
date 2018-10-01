import Server from './server';
import { PlayerSocket } from '../lib/types';
import * as WebSocket from 'ws';
import chalk from 'chalk';

class Player {
  id: string;
  name: string;
  wins: number = 0;
  losses: number = 0;
  challengerID: string;
  opponentID: string;

  constructor(public server: Server, public ws: PlayerSocket) {
    this.id = ws.id;
    this.onConnect();
  }

  private log(...data: any) {
    const idText = `[${chalk.cyan(this.id)}]`;
    console.log(idText, ...data);
  }

  private onConnect = () => {
    const { server, ws } = this;

    this.sendData('id', this.id);
    this.sendData('playerlist', server.getGameData());

    ws.on('message', (data: string) => {
      console.log('Incoming data:', JSON.parse(data));
      this.onMessage(data);
    });

    ws.on('close', () => {
      this.onClose();
    });

    this.log(`New connection. Online: ${server.wss.clients.size}`);
  };

  onMessage(data: string): void {
    const { server } = this;
    const [command, ...args] = JSON.parse(data);

    if (command === 'signin' && args.length === 1) {
      this.name = args[0];
      server.sendGameData();
      this.waitForGame();

      this.log(`Signed in: ${this.name}`);
    }

    if (command === 'challenge to') {
      const targetID = args[0];
      this.sendChallenge(targetID);
    }

    if (command === 'challenge from') {
      this.challengerID = args[0];
      server.sendGameData();
    }

    if (command === 'challenge accept') {
      const opponent = server.getPlayerByID(this.challengerID);

      this.opponentID = this.challengerID;
      delete this.challengerID;

      if (!opponent) return;

      this.sendData('start game');
      opponent.sendData('startgame');
      server.sendGameData();

      console.log(`New match: ${this.name} vs. ${opponent.name}`);
    }
  }

  onClose(): void {
    const { server } = this;
    const name = this.name || 'Someone';

    this.disconnect();
    server.sendGameData();

    this.log(`${name} disconnected. Online: ${server.wss.clients.size}`);
  }

  waitForGame(): void {
    setTimeout(() => {
      if (!this.opponentID) {
        this.waitForGame();
      }
    }, 100);
  }

  setOpponentID(opponentID: string): void {
    this.opponentID = opponentID;
  }

  sendChallenge(opponentID: string): void {
    const { server } = this;
    const opponent = server.getPlayerByID(opponentID);

    opponent && opponent.sendData('challenge from', this.id);
  }

  sendToElse(...data: any): void {
    if (!data.length) return;

    const { sockets } = this.server;
    const json = JSON.stringify(data);

    for (const socket of sockets) {
      if (socket.id !== this.id && socket.readyState === WebSocket.OPEN) {
        socket.send(json);
      }
    }
  }

  sendData(...data: any): void {
    if (!data.length) return;
    const json = JSON.stringify(data);
    this.ws.send(json);
  }

  disconnect(): void {
    const { server } = this;
    const opponent = server.getPlayerByID(this.opponentID);

    opponent && delete opponent.opponentID;
    delete this.opponentID;

    server.sockets = server.sockets.filter(x => x.id !== this.id);
  }
}

export default Player;
