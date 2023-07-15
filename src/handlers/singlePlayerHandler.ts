import { randomUUID } from 'crypto';
import { WebSocket } from 'ws';
import { activeRooms } from '../db';

export const singlePlayerHandler = (ws: WebSocket) => {
  const roomId = randomUUID();
  const playerId = randomUUID();
  ws.send(
    JSON.stringify({
      type: 'create_game',
      data: JSON.stringify({
        idGame: roomId,
        idPlayer: playerId,
      }),
    })
  );
  activeRooms.push({
    roomId: roomId,
    players: [
      { id: playerId, websocet: ws, ships: null },
      {
        id: 'comp',
        websocet: null,
        ships: [
          {
            position: { x: 3, y: 1 },
            direction: false,
            type: 'huge',
            length: 4,
          },
          {
            position: { x: 1, y: 5 },
            direction: true,
            type: 'large',
            length: 3,
          },
          {
            position: { x: 3, y: 8 },
            direction: false,
            type: 'large',
            length: 3,
          },
          {
            position: { x: 8, y: 5 },
            direction: true,
            type: 'medium',
            length: 2,
          },
          {
            position: { x: 4, y: 4 },
            direction: true,
            type: 'medium',
            length: 2,
          },
          {
            position: { x: 0, y: 2 },
            direction: false,
            type: 'medium',
            length: 2,
          },
          {
            position: { x: 8, y: 2 },
            direction: false,
            type: 'small',
            length: 1,
          },
          {
            position: { x: 6, y: 4 },
            direction: false,
            type: 'small',
            length: 1,
          },
          {
            position: { x: 8, y: 0 },
            direction: true,
            type: 'small',
            length: 1,
          },
          {
            position: { x: 6, y: 6 },
            direction: true,
            type: 'small',
            length: 1,
          },
        ],
      },
    ],
    playerTurn: null,
    isSingle: true,
  });
};
