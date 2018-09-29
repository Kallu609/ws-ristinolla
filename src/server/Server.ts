import * as uu from 'uuid';
import * as WebSocket from 'ws';
import Player from './Player';
import { PlayerSocket, IPlayer } from '../lib/types';

class Server {
  wss: WebSocket.Server;
  sockets: Array<PlayerSocket>;

  constructor(public port: number) {
    this.sockets = [];
    this.create();
  }

  create(): void {
    this.wss = new WebSocket.Server({ port: this.port });

    this.wss.on('connection', (ws: PlayerSocket) => {
      ws.id = uu.v4();
      ws.player = new Player(this, ws);

      this.sockets.push(ws);
    });
  }

  sendToAll(data: any): void {
    for (const socket of this.sockets) {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(data);
      }
    }
  }

  getPlayers(): Array<Player> {
    const players = this.sockets
      .map(socket => {
        if (!socket.player || !socket.player.name) return;

        const { name, wins, losses, playing, id, ...rest } = socket.player;

        return {
          name,
          wins,
          losses,
          playing,
          id,
        } as IPlayer;
      })
      .filter(x => x);

    return players as Array<Player>;
  }

  getAvailablePlayers(): Array<Player> {
    const available = this.getPlayers()
      .map(player => {
        return !player.playing ? player : undefined;
      })
      .filter(x => x);

    return available as Array<Player>;
  }

  sendPlayersToAll(): void {
    const json = JSON.stringify(this.getPlayers());
    this.sendToAll(`playerlist ${json}`);
  }
}

export default Server;
