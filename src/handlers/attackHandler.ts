import { ActiveRoom } from '../type';

export const attackHandler = (parsedData: any, activeRooms: ActiveRoom[]) => {
  const { gameId, x, y, indexPlayer } = JSON.parse(parsedData.data);
  const activeGame = activeRooms.find((el) => el.roomId === gameId)!;
  const activeGameIndex = activeRooms.findIndex((el) => el.roomId === gameId);
  console.log(x, y);
  console.log(activeGame);
  if (activeGameIndex === -1) {
    console.log('no game');
    return;
  }

  if (activeGame.playerTurn !== indexPlayer) {
    return;
  }

  const { ships, websocet, id } = activeGame.players.find(
    (el) => el.id !== indexPlayer
  )!;
  const currWebsocet = activeGame.players.find((el) => el.id === indexPlayer)
    ?.websocet!;
  // console.log(ships);

  const attackResultHandler = (ships: any, x: number, y: number) => {
    let result: 'miss' | 'killed' | 'shot' | 'winner';
    result = 'miss';
    let length = 0;
    let direction = true;
    let position = { x: 0, y: 0 };
    const newShips = ships.map((el: any) => {
      let live = el.live === undefined ? el.length : el.live;
      for (let i = 0; i < el.length; i++) {
        if (!el.direction) {
          if (x === el.position.x + i && y === el.position.y) {
            if (el.length === 1 || (el.live && el.live === 1)) {
              live = 0;
              result = 'killed';
              length = el.length;
              direction = el.direction;
              position = el.position;
            } else if (live === 0) {
              result = 'killed';
              length = el.length;
              direction = el.direction;
              position = el.position;
            } else {
              live -= 1;
              result = 'shot';
            }
          }
        } else {
          if (y === el.position.y + i && x === el.position.x) {
            if (el.length === 1 || (el.live && el.live === 1)) {
              live = 0;
              result = 'killed';
              length = el.length;
              direction = el.direction;
              position = el.position;
            } else if (live === 0) {
              result = 'killed';
              length = el.length;
              direction = el.direction;
              position = el.position;
            } else {
              live -= 1;
              result = 'shot';
            }
          }
        }
      }
      return {
        ...el,
        live,
      };
    });

    const isWinner = newShips.every((el: any) => el.live === 0);

    if (isWinner) {
      result = 'winner';
    }

    const curentPlayerIndex = activeRooms[activeGameIndex].players.findIndex(
      (el: any) => el.id === id
    );
    activeRooms[activeGameIndex].players[curentPlayerIndex].ships = newShips;

    return {
      result,
      length,
      direction,
      position,
    };
  };

  const attackResult = attackResultHandler(ships, x, y);

  const missMessage = (x: number, y: number) =>
    JSON.stringify({
      type: 'attack',
      data: JSON.stringify({
        position: {
          x,
          y,
        },
        currentPlayer: indexPlayer,
        status: 'miss',
      }),
      id: 0,
    });

  const opponentsTurnMessage = JSON.stringify({
    type: 'turn',
    data: JSON.stringify({
      currentPlayer: id,
    }),
    id: 0,
  });

  const currentPlayerTurnMessage = JSON.stringify({
    type: 'turn',
    data: JSON.stringify({
      currentPlayer: indexPlayer,
    }),
    id: 0,
  });

  const shotMessage = JSON.stringify({
    type: 'attack',
    data: JSON.stringify({
      position: {
        x,
        y,
      },
      currentPlayer: indexPlayer,
      status: 'shot',
    }),
    id: 0,
  });

  const killMessage = (x: number, y: number) =>
    JSON.stringify({
      type: 'attack',
      data: JSON.stringify({
        position: {
          x,
          y,
        },
        currentPlayer: indexPlayer,
        status: 'killed',
      }),
      id: 0,
    });

  const winnerMessage = JSON.stringify({
    type: 'finish',
    data: JSON.stringify({
      winPlayer: indexPlayer,
    }),
    id: 0,
  });

  if (attackResult.result === 'winner') {
    activeRooms.splice(activeGameIndex, 1);
    currWebsocet.send(winnerMessage);
    websocet?.send(winnerMessage);
    return currWebsocet;
  } else if (attackResult.result === 'miss') {
    activeRooms[activeGameIndex].playerTurn = id || null;
    currWebsocet.send(missMessage(x, y));
    websocet?.send(missMessage(x, y));
    currWebsocet.send(opponentsTurnMessage);
    websocet?.send(opponentsTurnMessage);
  } else if (attackResult.result === 'shot') {
    currWebsocet.send(shotMessage);
    websocet?.send(shotMessage);
    currWebsocet.send(currentPlayerTurnMessage);
    websocet?.send(currentPlayerTurnMessage);
  } else if (attackResult.result === 'killed') {
    for (let i = 0; i < attackResult.length; i++) {
      //horesontal

      if (!attackResult.direction) {
        //missing
        if (i === 0) {
          currWebsocet.send(
            missMessage(attackResult.position.x - 1, attackResult.position.y)
          );

          currWebsocet.send(
            missMessage(
              attackResult.position.x - 1,
              attackResult.position.y - 1
            )
          );

          currWebsocet.send(
            missMessage(
              attackResult.position.x - 1,
              attackResult.position.y + 1
            )
          );

          currWebsocet.send(
            missMessage(attackResult.position.x, attackResult.position.y + 1)
          );

          currWebsocet.send(
            missMessage(attackResult.position.x, attackResult.position.y - 1)
          );

          //second player

          websocet?.send(
            missMessage(attackResult.position.x - 1, attackResult.position.y)
          );

          websocet?.send(
            missMessage(
              attackResult.position.x - 1,
              attackResult.position.y - 1
            )
          );

          websocet?.send(
            missMessage(
              attackResult.position.x - 1,
              attackResult.position.y + 1
            )
          );

          websocet?.send(
            missMessage(attackResult.position.x, attackResult.position.y + 1)
          );

          websocet?.send(
            missMessage(attackResult.position.x, attackResult.position.y - 1)
          );
        }

        if (i === attackResult.length - 1) {
          currWebsocet.send(
            missMessage(
              attackResult.position.x + attackResult.length,
              attackResult.position.y
            )
          );

          currWebsocet.send(
            missMessage(
              attackResult.position.x + attackResult.length,
              attackResult.position.y - 1
            )
          );

          currWebsocet.send(
            missMessage(
              attackResult.position.x + attackResult.length,
              attackResult.position.y + 1
            )
          );

          currWebsocet.send(
            missMessage(
              attackResult.position.x + attackResult.length - 1,
              attackResult.position.y + 1
            )
          );

          currWebsocet.send(
            missMessage(
              attackResult.position.x + attackResult.length - 1,
              attackResult.position.y - 1
            )
          );

          //secondPlayer

          websocet?.send(
            missMessage(
              attackResult.position.x + attackResult.length,
              attackResult.position.y
            )
          );

          websocet?.send(
            missMessage(
              attackResult.position.x + attackResult.length,
              attackResult.position.y - 1
            )
          );

          websocet?.send(
            missMessage(
              attackResult.position.x + attackResult.length,
              attackResult.position.y + 1
            )
          );

          websocet?.send(
            missMessage(
              attackResult.position.x + attackResult.length - 1,
              attackResult.position.y + 1
            )
          );

          websocet?.send(
            missMessage(
              attackResult.position.x + attackResult.length - 1,
              attackResult.position.y - 1
            )
          );
        }

        //simple miss

        currWebsocet.send(
          missMessage(attackResult.position.x + i, attackResult.position.y - 1)
        );

        currWebsocet.send(
          missMessage(attackResult.position.x + i, attackResult.position.y + 1)
        );

        websocet?.send(
          missMessage(attackResult.position.x + i, attackResult.position.y - 1)
        );

        websocet?.send(
          missMessage(attackResult.position.x + i, attackResult.position.y + 1)
        );

        //killed
        currWebsocet.send(
          killMessage(attackResult.position.x + i, attackResult.position.y)
        );

        websocet?.send(
          killMessage(attackResult.position.x + i, attackResult.position.y)
        );
      } else {
        //vertical

        //missing
        if (i === 0) {
          currWebsocet.send(
            missMessage(attackResult.position.x, attackResult.position.y - 1)
          );

          currWebsocet.send(
            missMessage(
              attackResult.position.x - 1,
              attackResult.position.y - 1
            )
          );

          currWebsocet.send(
            missMessage(
              attackResult.position.x + 1,
              attackResult.position.y - 1
            )
          );

          currWebsocet.send(
            missMessage(attackResult.position.x + 1, attackResult.position.y)
          );

          currWebsocet.send(
            missMessage(attackResult.position.x - 1, attackResult.position.y)
          );

          //second player

          websocet?.send(
            missMessage(attackResult.position.x, attackResult.position.y - 1)
          );

          websocet?.send(
            missMessage(
              attackResult.position.x - 1,
              attackResult.position.y - 1
            )
          );

          websocet?.send(
            missMessage(
              attackResult.position.x + 1,
              attackResult.position.y - 1
            )
          );

          websocet?.send(
            missMessage(attackResult.position.x + 1, attackResult.position.y)
          );

          websocet?.send(
            missMessage(attackResult.position.x - 1, attackResult.position.y)
          );
        }

        if (i === attackResult.length - 1) {
          currWebsocet.send(
            missMessage(
              attackResult.position.x,
              attackResult.position.y + attackResult.length
            )
          );
          currWebsocet.send(
            missMessage(
              attackResult.position.x - 1,
              attackResult.position.y + attackResult.length
            )
          );
          currWebsocet.send(
            missMessage(
              attackResult.position.x + 1,
              attackResult.position.y + attackResult.length
            )
          );
          currWebsocet.send(
            missMessage(
              attackResult.position.x + 1,
              attackResult.position.y + attackResult.length - 1
            )
          );
          currWebsocet.send(
            missMessage(
              attackResult.position.x - 1,
              attackResult.position.y + attackResult.length - 1
            )
          );

          //secondPlayer
          websocet?.send(
            missMessage(
              attackResult.position.x,
              attackResult.position.y + attackResult.length
            )
          );
          websocet?.send(
            missMessage(
              attackResult.position.x - 1,
              attackResult.position.y + attackResult.length
            )
          );
          websocet?.send(
            missMessage(
              attackResult.position.x + 1,
              attackResult.position.y + attackResult.length
            )
          );
          websocet?.send(
            missMessage(
              attackResult.position.x + 1,
              attackResult.position.y + attackResult.length - 1
            )
          );
          websocet?.send(
            missMessage(
              attackResult.position.x - 1,
              attackResult.position.y + attackResult.length - 1
            )
          );
        }

        //simple miss

        currWebsocet.send(
          missMessage(attackResult.position.x - 1, attackResult.position.y + i)
        );
        currWebsocet.send(
          missMessage(attackResult.position.x + 1, attackResult.position.y + i)
        );
        websocet?.send(
          missMessage(attackResult.position.x - 1, attackResult.position.y + i)
        );
        websocet?.send(
          missMessage(attackResult.position.x + 1, attackResult.position.y + i)
        );

        //killed

        currWebsocet.send(
          killMessage(attackResult.position.x, attackResult.position.y + i)
        );
        websocet?.send(
          killMessage(attackResult.position.x, attackResult.position.y + i)
        );
      }
    }

    //turns
    currWebsocet.send(currentPlayerTurnMessage);
    websocet?.send(currentPlayerTurnMessage);
  }
};
