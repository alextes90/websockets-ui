import { activeRooms } from '../db';

export const startDataHandler = (data: any) => {
  for (let i = 0; i < 2; i++) {
    data.players[i].websocet.send(
      JSON.stringify({
        type: 'start_game',
        data: JSON.stringify({
          ships: data.players[i].ships,
          currentPlayerIndex: data.players[i].id,
        }),
        id: 0,
      })
    );
    if (i === 0) {
      data.playerTurn = data.players[0].id;

      data.players[i].websocet.send(
        JSON.stringify({
          type: 'turn',
          data: JSON.stringify({
            currentPlayer: data.players[i].id,
          }),
          id: 0,
        })
      );
    } else {
      data.players[i].websocet.send(
        JSON.stringify({
          type: 'turn',
          data: JSON.stringify({
            currentPlayer: data.players[0].id,
          }),
          id: 0,
        })
      );
    }
  }
};
