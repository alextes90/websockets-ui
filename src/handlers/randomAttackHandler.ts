import { ActiveRoom } from '../type';
import { attackHandler } from './attackHandler';

export const randomAttackHandler = (
  parsedData: any,
  activeRooms: ActiveRoom[]
) => {
  const x = Math.floor(Math.random() * 10);
  const y = Math.floor(Math.random() * 10);
  const { gameId, indexPlayer } = JSON.parse(parsedData.data);
  const dataToAttackHandler = {
    data: JSON.stringify({ x, y, gameId, indexPlayer }),
  };
  attackHandler(dataToAttackHandler, activeRooms);
};
