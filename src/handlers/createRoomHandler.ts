import { randomUUID } from 'crypto';
import { gamesDb } from '../db';

export const createRoomHandler = () => {
  const roomId = randomUUID();
  const playerId = randomUUID();

  gamesDb.push({
    roomId,
    roomUsers: [{ name: 'player1', index: playerId }],
  });

  return {
    type: 'create_game',
    data: JSON.stringify({
      idGame: roomId,
      idPlayer: playerId,
    }),
  };
};
