import * as WebSocket from 'ws';
import Player from '../server/player';

export interface PlayerSocket extends WebSocket {
  id: string;
  player?: Player;
  sendToAll: (data: string) => void;
  sendToElse: (data: string) => void;
  sendJSON: (json: object) => void;
}

export interface IPlayer {
  id: string;
  name: string;
  wins: number;
  losses: number;
  opponentID: string;
}

export type IGameData = Array<IPlayer>;
