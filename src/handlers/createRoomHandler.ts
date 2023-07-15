import { randomUUID } from 'crypto';
import { db, gamesDb } from '../db';
import { WebSocket } from 'ws';

export const createRoomHandler = (ws: WebSocket) => {
  const roomId = randomUUID();
  const playerId = randomUUID();
  const gameCreatorName = db.find((room) => room.websocet === ws);
  gamesDb.push({
    roomId,
    roomUsers: [{ name: gameCreatorName?.login || 'player1', index: playerId }],
  });

  return {
    type: 'create_game',
    data: JSON.stringify({
      idGame: roomId,
      idPlayer: playerId,
    }),
  };
};
