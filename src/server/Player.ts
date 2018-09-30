import Server from './Server';
import { PlayerSocket } from '../lib/types';
import * as WebSocket from 'ws';

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

      if (command === 'challenge' && args.length === 2) {
        const [action, value] = args;

        if (action === 'to') {
          this.sendChallenge(value);
        }

        if (action === 'from') {
          this.challengerID = value;
          server.sendPlayersToAll();
        }

        if (action === 'accept') {
          this.opponentID = this.challengerID;
          delete this.challengerID;

          const opponent = server
            .getPlayers()
            .find(x => x.id === this.opponentID) as Player;

          ws.send('startgame');
          opponent.ws.send('startgame');

          server.sendPlayersToAll();
        }
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

  sendChallenge(opponentID: string): void {
    const { server } = this;
    const opponent = server.getPlayers().find(x => x.id === opponentID);

    opponent && opponent.ws.send(`challenge from ${this.id}`);
  }

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
