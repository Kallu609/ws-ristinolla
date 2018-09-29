import Server from './Server';
import { PlayerSocket } from '../lib/types';
import * as WebSocket from 'ws';

class Player {
  id: string;
  name: string;
  wins: number = 0;
  losses: number = 0;
  playing: boolean = false;

  constructor(public server: Server, public ws: PlayerSocket) {
    this.id = ws.id;
    this.onConnect();
  }

  onConnect = () => {
    const { server, ws } = this;

    ws.send(`id ${ws.id}`);
    this.getPlayers();

    ws.on('message', (msg: string) => {
      const [command, ...args] = msg.split(' ');

      if (command === 'signin' && args.length > 0) {
        this.name = args.join(' ');
        server.sendPlayersToAll();
        this.searchGame();

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

  searchGame(): void {
    const { server, ws } = this;

    setTimeout(() => {
      const players = server
        .getAvailablePlayers()
        .filter(plr => plr.id !== this.id);

      if (players.length === 0) {
        return this.searchGame();
      }

      const opponent = players[Math.floor(Math.random() * players.length)];
      this.startGameWith(opponent);
    }, 500);
  }

  startGameWith(player: Player) {
    console.log('starting game with ' + player.name);
  }

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

  getPlayers(): void {
    const { server, ws } = this;
    const json = JSON.stringify(server.getPlayers());

    ws.send(`playerlist ${json}`);
  }
}

export default Player;
