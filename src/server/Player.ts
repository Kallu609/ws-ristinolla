import Server from './Server';
import { PlayerSocket } from '../lib/types';
import * as WebSocket from 'ws';

class Player {
  name: string;
  wins: number = 0;
  losses: number = 0;

  constructor(public server: Server, public ws: PlayerSocket) {
    this.socketHandler();
  }

  socketHandler = () => {
    const { server, ws } = this;
    this.getPlayerList();

    ws.on('message', (msg: string) => {
      const [command, ...args] = msg.split(' ');

      if (command === 'signin' && args.length > 0) {
        this.name = args.join(' ');
        server.sendPlayersToAll();

        console.log(`Sign in from: ${this.name}`);
      }
    });

    ws.on('close', () => {
      this.remove();
      server.sendPlayersToAll();

      console.log(
        `${this.name || 'Anon'} disconnected. Online: ${
          server.wss.clients.size
        }`
      );
    });

    console.log(`New connection. Online: ${server.wss.clients.size}`);
  };

  sendToElse(data: any): void {
    const { sockets } = this.server;

    for (const socket of sockets) {
      if (socket.id !== this.ws.id && socket.readyState === WebSocket.OPEN) {
        socket.send(data);
      }
    }
  }

  remove(): void {
    const { server, ws } = this;
    server.sockets = server.sockets.filter(x => x.id !== ws.id);
  }

  getPlayerList(): void {
    const { server, ws } = this;
    const json = JSON.stringify(server.getPlayerNames());

    ws.send(`playerlist ${json}`);
  }
}

export default Player;
