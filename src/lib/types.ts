import * as WebSocket from 'ws';
import Player from '../server/Player';

export interface PlayerSocket extends WebSocket {
  id: string;
  player?: Player;
  sendToAll: (data: string) => void;
  sendToElse: (data: string) => void;
}

export interface IPlayer {
  socket?: WebSocket;
  id?: string;
  name: string;
  wins: number;
  losses: number;
  playing: boolean;
}

export interface PlayerList {
  [key: string]: IPlayer;
}
