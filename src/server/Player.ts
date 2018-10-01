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

  private log(...data: any[]) {
    const nameText = this.name ? `:${chalk.yellow(this.name)}` : '';
    const idText = `[${chalk.cyan(this.id)}${nameText}]`;

    console.log(idText, ...data);
  }

  private onConnect = () => {
    const { server, ws } = this;
    const clientCount = server.wss.clients.size;

    this.log(`New connection. Online: ${clientCount}`);

    this.sendData('id', this.id);
    this.sendData('playerlist', server.getGameData());

    ws.on('message', this.onMessage);
    ws.on('close', this.onClose);
  };

  onMessage = (data: string): void => {
    const { server } = this;
    const dataJSON = JSON.parse(data);
    const [command, ...args] = dataJSON;

    console.log('Incoming data:', dataJSON);

    if (command === 'signin' && args.length >= 1) {
      this.name = args.join(' ');

      server.sendGameData();

      this.log(`Sign in`);
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
      opponent.sendData('start game');
      server.sendGameData();

      console.log(`New match: ${this.name} vs. ${opponent.name}`);
    }
  };

  onClose = (): void => {
    const { server } = this;
    const clientCount = server.wss.clients.size;

    this.disconnect();
    server.sendGameData();

    this.log(`Disconnect. Online: ${clientCount}`);
  };

  setOpponentID(opponentID: string): void {
    this.opponentID = opponentID;
  }

  sendChallenge(opponentID: string): void {
    const { server } = this;
    const opponent = server.getPlayerByID(opponentID);

    opponent && opponent.sendData('challenge from', this.id);
  }

  sendToElse(...data: any[]): void {
    if (!data.length) return;

    const { sockets } = this.server;
    const json = JSON.stringify(data);

    for (const socket of sockets) {
      if (socket.id !== this.id && socket.readyState === WebSocket.OPEN) {
        socket.send(json);
      }
    }
  }

  sendData(...data: any[]): void {
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
