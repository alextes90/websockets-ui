import { RawData, WebSocket } from 'ws';
import { regHandler } from '../handlers/reg';
import { createRoomHandler } from '../handlers/createRoomHandler';
import { gamesDb } from '../db';
import { UUID, randomUUID } from 'crypto';
import { atackHandler } from '../handlers/atackHandler';

interface Players {
  id: UUID | undefined;
  websocet: WebSocket | null;
  ships: any;
}

export interface ActiveRoom {
  roomId: UUID;
  players: Players[];
}

const activeRooms: ActiveRoom[] = [];

export const messageHandler = (
  data: RawData,
  isBinary: boolean,
  ws: WebSocket
) => {
  const message = (isBinary ? data : data.toString()) as string;
  const parsedData = JSON.parse(message);
  console.log(parsedData);
  console.log('command: ', parsedData.type);
  switch (parsedData.type) {
    case 'reg':
      return regHandler(parsedData);
    case 'create_room':
      return createRoomHandler();
    case 'add_user_to_room':
      const { indexRoom } = JSON.parse(parsedData.data);
      const roomIndex = gamesDb.findIndex((el) => el.roomId === indexRoom);
      const room = gamesDb.find((room) => room.roomId === indexRoom);
      const opponentId = room?.roomUsers[0].index;
      gamesDb.splice(roomIndex, 1);
      const playerOId = randomUUID();

      const roomIndexWithReadyPlayer = activeRooms.findIndex(
        (el) => el.roomId === indexRoom
      );

      if (roomIndexWithReadyPlayer !== -1) {
        activeRooms[roomIndexWithReadyPlayer].players.push({
          id: playerOId,
          websocet: null,
          ships: null,
        });
      } else {
        activeRooms.push({
          roomId: indexRoom,
          players: [
            { id: playerOId, websocet: null, ships: null },
            { id: opponentId, websocet: null, ships: null },
          ],
        });
      }

      return {
        type: 'create_game',
        data: JSON.stringify({ idGame: indexRoom, idPlayer: playerOId }),
      };
    case 'add_ships':
      const { gameId, ships, indexPlayer } = JSON.parse(parsedData.data);
      const activeGameIndex = activeRooms.findIndex(
        (el) => el.roomId === gameId
      );

      if (activeGameIndex === -1) {
        activeRooms.push({
          roomId: gameId,
          players: [{ id: indexPlayer, websocet: ws, ships: ships }],
        });
      } else {
        const curentPlayerIndex = activeRooms[
          activeGameIndex
        ].players.findIndex((el: any) => el.id === indexPlayer);
        activeRooms[activeGameIndex].players[curentPlayerIndex].websocet = ws;
        activeRooms[activeGameIndex].players[curentPlayerIndex].ships = ships;

        return { type: 'InnerStart', data: activeRooms[activeGameIndex] };
      }
      break;
    case 'attack':
      atackHandler(parsedData, activeRooms);
  }
};
