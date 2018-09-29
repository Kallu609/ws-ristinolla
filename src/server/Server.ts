import * as uu from 'uuid';
import * as WebSocket from 'ws';
import Player from './Player';
import { PlayerSocket } from '../lib/types';


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
      .map(socket => socket.player)
      .filter(x => x);

    return players as Array<Player>;
  }

  getPlayerNames(): Array<string> {
    const names = this.getPlayers()
      .map(player => player.name)
      .filter(x => x);
    
    return names;
  }
  
  sendPlayersToAll(): void {
    const json = JSON.stringify(this.getPlayerNames());
    this.sendToAll(`playerlist ${json}`);
  }
  
}

export default Server;