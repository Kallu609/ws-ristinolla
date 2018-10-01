import * as WebSocket from 'ws';
import Player from './player';
import { PlayerSocket, IPlayer, IGameData } from '../lib/types';
import { generateUUID } from '../lib/uuid-generator';
import { webSocketPort } from '../../config';

class Server {
  port: number;
  wss: WebSocket.Server;
  sockets: Array<PlayerSocket> = [];

  constructor() {
    this.port = webSocketPort;
    this.create();
  }

  create(): void {
    this.wss = new WebSocket.Server({ port: this.port });

    this.wss.on('connection', (ws: PlayerSocket) => {
      ws.id = generateUUID();
      ws.player = new Player(this, ws);

      this.sockets.push(ws);
    });
  }

  sendToAll(...data: any[]): void {
    if (!data || !data.length) return;
    const json = JSON.stringify(data);

    for (const socket of this.sockets) {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(json);
      }
    }
  }

  sendGameData(): void {
    this.sendToAll('playerlist', this.getGameData());
  }

  getPlayers(): Array<Player> {
    const players = this.sockets
      .map(socket => {
        if (!socket.player || !socket.player.name) return;
        return socket.player;
      })
      .filter(Boolean);

    return players as Array<Player>;
  }

  getAvailablePlayers(): Array<Player> {
    const available = this.getPlayers()
      .map(player => {
        return !player.opponentID ? player : undefined;
      })
      .filter(Boolean);

    return available as Array<Player>;
  }

  getPlayerByID(id: string): Player | undefined {
    const socket = this.sockets.find(x => x.id === id) as PlayerSocket;
    return socket && socket.player ? socket.player : undefined;
  }

  getGameData(): IGameData {
    const gameData = this.getPlayers().map(player => {
      const { name, wins, losses, id, opponentID, ...rest } = player;
      return {
        name,
        wins,
        losses,
        id,
        opponentID,
      } as IPlayer;
    });

    return gameData;
  }

  createMatch(player1: Player, player2: Player): void {
    player1.opponentID = player2.id;
    player2.opponentID = player1.id;

    this.sendToAll('playerlist', this.getGameData());

    player1.ws.send(`startmatch`);
    player2.ws.send(`startmatch`);

    console.log(`Match started: ${player1.name} VS ${player2.name}`);
  }
}

export default Server;
