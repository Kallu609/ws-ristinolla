import Server from './Server';
import { PlayerSocket } from '../lib/types';
import * as WebSocket from 'ws';

class Player {
  id: string;
  name: string;
  wins: number = 0;
  losses: number = 0;
  opponentID: string;

  constructor(public server: Server, public ws: PlayerSocket) {
    this.id = ws.id;
    this.onConnect();
  }

  private onConnect = () => {
    const { server, ws } = this;

    ws.send(`id ${this.id}`);
    this.getPlayers();

    ws.on('message', (msg: string) => {
      const [command, ...args] = msg.split(' ');

      if (command === 'signin' && args.length > 0) {
        this.name = args.join(' ');
        server.sendPlayersToAll();
        this.waitForGame();

        console.log(`[${this.id}] Signed in: ${this.name}`);
      }
    });

    ws.on('close', () => {
      this.remove();
      server.sendPlayersToAll();

      const name = this.name || 'Someone';
      console.log(
        `[${this.id}] ${name} disconnected. Online: ${server.wss.clients.size}`
      );
    });

    console.log(
      `[${this.id}] New connection. Online: ${server.wss.clients.size}`
    );
  };

  waitForGame(): void {
    setTimeout(() => {
      if (!this.opponentID) {
        this.waitForGame();
      }
    }, 100);
  }

  sendToElse(data: any): void {
    const { sockets } = this.server;

    for (const socket of sockets) {
      if (socket.id !== this.id && socket.readyState === WebSocket.OPEN) {
        socket.send(data);
      }
    }
  }

  remove(): void {
    const { server } = this;

    delete this.opponentID;
    server.sockets = server.sockets.filter(x => x.id !== this.id);
  }

  getPlayers(): void {
    const { server, ws } = this;
    const json = JSON.stringify(server.getGameData());

    ws.send(`playerlist ${json}`);
  }

  setOpponentID(opponentID: string): void {
    this.opponentID = opponentID;
  }
}

export default Player;
