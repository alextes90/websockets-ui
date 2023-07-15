import { WebSocketServer } from 'ws';
import 'dotenv/config';
import { messageHandler } from '../utils/messageHandler';
import { responseHandler } from '../utils/responseHandler';
import { activeRooms, db, gamesDb, winnersDb } from '../db';
import { startDataHandler } from '../handlers/startDataHandler';

const PORT = Number(process.env.PORT || 3000);

export const wss = new WebSocketServer({
  port: PORT,
});

const connectedClients = new Map();

wss.on('connection', (ws, req) => {
  console.log(
    'New connection from address:',
    req.socket.remoteAddress,
    'port:',
    req.socket.remotePort
  );

  connectedClients.set(ws, true);
  ws.on('pong', () => {
    connectedClients.set(ws, true);
  });

  ws.on('close', () => {
    const isPlaying = activeRooms.find((el) =>
      el.players.find((player) => player.websocet === ws)
    );
    if (isPlaying) {
      const winnerWebsocet = isPlaying?.players.find(
        (el) => el.websocet !== ws
      );

      const winnerName = db.find(
        (room) => room.websocet === winnerWebsocet?.websocet
      );
      const currentWinnerIndex = winnersDb.findIndex(
        (el) => el.name === winnerName?.login
      );

      if (!isPlaying.isSingle) {
        if (currentWinnerIndex > -1) {
          winnersDb[currentWinnerIndex].wins += 1;
        } else {
          winnersDb.push({ name: winnerName?.login || 'player1', wins: 1 });
        }
      }

      winnerWebsocet?.websocet?.send(
        JSON.stringify({
          type: 'finish',
          data: JSON.stringify({
            winPlayer: winnerWebsocet.id,
          }),
          id: 0,
        })
      );

      wss.clients.forEach((socket) => {
        socket.send(
          JSON.stringify({
            type: 'update_winners',
            data: JSON.stringify(winnersDb),
            id: 0,
          })
        );
      });
    }

    connectedClients.delete(ws);
  });

  ws.on('message', (data, isBinary) => {
    try {
      const response = messageHandler(data, isBinary, ws);

      if (response?.type === 'create_game') {
        wss.clients.forEach((socket) => {
          socket.send(
            JSON.stringify({
              type: 'update_room',
              data: JSON.stringify(gamesDb),
              id: 0,
            })
          );
        });
      }
      if (response?.type === 'Winner') {
        wss.clients.forEach((socket) => {
          socket.send(
            JSON.stringify({
              type: 'update_winners',
              data: JSON.stringify(winnersDb),
              id: 0,
            })
          );
        });
      }
      if (response && response.type === 'InnerStart') {
        startDataHandler(response.data);
      } else if (response) {
        const responseToSend = responseHandler(response) as string;
        ws.send(responseToSend);
        if (gamesDb.length > 0) {
          ws.send(
            JSON.stringify({
              type: 'update_room',
              data: JSON.stringify(gamesDb),
              id: 0,
            })
          );
        }
        if (winnersDb.length > 0) {
          ws.send(
            JSON.stringify({
              type: 'update_winners',
              data: JSON.stringify(winnersDb),
              id: 0,
            })
          );
        }
      }
    } catch {
      console.error('Bad JSON');
    }
  });
});

const intervalId = setInterval(() => {
  Array.from(connectedClients.keys()).forEach((ws) => {
    if (!connectedClients.get(ws)) {
      ws.terminate();
      return;
    }
    connectedClients.set(ws, false);
    ws.ping();
  });
}, 5000);

process.on('SIGINT', () => {
  wss.clients.forEach((socket) => {
    socket.close();
  });

  wss.close();

  clearInterval(intervalId);

  console.log('Websocet server closed');
});
