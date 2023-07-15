import { UUID } from 'crypto';
import { WebSocket } from 'ws';

export interface User {
  id: UUID;
  login: string;
  password: string;
  websocet: WebSocket;
}

export interface Rooms {
  roomId: UUID;
  roomUsers: InGameUserr[];
}
interface InGameUserr {
  name: string;
  index: UUID;
}

export interface Winner {
  name: string;
  wins: number;
}

interface Players {
  id: UUID | undefined | 'comp';
  websocet: WebSocket | null;
  ships: any;
}

export interface ActiveRoom {
  roomId: UUID;
  players: Players[];
  playerTurn: UUID | null | 'comp';
  isSingle: boolean;
}
