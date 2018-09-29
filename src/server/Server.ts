import * as WebSocket from 'ws';
import Player from './Player';
import { PlayerSocket, IPlayer, IGameData } from '../lib/types';
import { generateUUID } from '../lib/uuidGenerator';

class Server {
  wss: WebSocket.Server;
  sockets: Array<PlayerSocket> = [];

  constructor(public port: number) {
    this.create();
  }

  create(): void {
    this.wss = new WebSocket.Server({ port: this.port });

    this.wss.on('connection', (ws: PlayerSocket) => {
      ws.id = generateUUID();
      ws.player = new Player(this, ws);

      this.sockets.push(ws);
    });

    this.matchMaker();
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

  sendPlayersToAll(): void {
    const json = JSON.stringify(this.getGameData());
    this.sendToAll(`playerlist ${json}`);
  }

  matchMaker(): void {
    /*const players = this.getAvailablePlayers();

    if (players.length >= 2) {
      this.createMatch(players[0], players[1]);
    }

    setTimeout(() => {
      this.matchMaker();
    }, 100);*/
  }

  createMatch(player1: Player, player2: Player): void {
    player1.opponentID = player2.id;
    player2.opponentID = player1.id;

    this.sendPlayersToAll();

    player1.ws.send(`startmatch`);
    player2.ws.send(`startmatch`);

    console.log(`Match started: ${player1.name} VS ${player2.name}`);
  }
}

export default Server;
