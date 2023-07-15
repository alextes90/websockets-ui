import { RawData, WebSocket } from 'ws';
import { regHandler } from '../handlers/reg';
import { createRoomHandler } from '../handlers/createRoomHandler';
import { activeRooms, db, gamesDb, winnersDb } from '../db';
import { randomUUID } from 'crypto';
import { attackHandler } from '../handlers/attackHandler';
import { randomAttackHandler } from '../handlers/randomAttackHandler';
import { singlePlayerHandler } from '../handlers/singlePlayerHandler';

export const messageHandler = (
  data: RawData,
  isBinary: boolean,
  ws: WebSocket
) => {
  const message = (isBinary ? data : data.toString()) as string;
  const parsedData = JSON.parse(message);
  console.log('command: ', parsedData.type);
  switch (parsedData.type) {
    case 'reg':
      return regHandler(parsedData, ws);
    case 'create_room':
      return createRoomHandler(ws);
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
          playerTurn: null,
          isSingle: false,
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
          playerTurn: null,
          isSingle: false,
        });
      } else {
        const curentPlayerIndex = activeRooms[
          activeGameIndex
        ].players.findIndex((el) => el.id === indexPlayer);
        activeRooms[activeGameIndex].players[curentPlayerIndex].websocet = ws;
        activeRooms[activeGameIndex].players[curentPlayerIndex].ships = ships;

        return { type: 'InnerStart', data: activeRooms[activeGameIndex] };
      }
      break;
    case 'attack':
      const winnerSocet = attackHandler(parsedData, activeRooms);

      if (winnerSocet?.currWebsocet) {
        const winnerName = db.find(
          (room) => room.websocet === winnerSocet.currWebsocet
        );
        const currentWinnerIndex = winnersDb.findIndex(
          (el) => el.name === winnerName?.login
        );

        if (!winnerSocet.isSingle) {
          if (currentWinnerIndex > -1) {
            winnersDb[currentWinnerIndex].wins += 1;
          } else {
            winnersDb.push({ name: winnerName?.login || 'player1', wins: 1 });
          }
        }

        return { type: 'Winner', data: winnerSocet };
      }
      break;
    case 'randomAttack':
      randomAttackHandler(parsedData, activeRooms);
      break;
    case 'single_play':
      singlePlayerHandler(ws);
      break;
  }
};
