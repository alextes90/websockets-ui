import { WebSocketServer } from 'ws';
import 'dotenv/config';
import { messageHandler } from '../utils/messageHandler';
import { responseHandler } from '../utils/responseHandler';
import { gamesDb, winnersDb } from '../db';
import { startDataHandler } from '../handlers/startDataHandler';

const PORT = Number(process.env.PORT || 3000);

export const wss = new WebSocketServer({
  port: PORT,
});

wss.on('connection', (ws, req) => {
  console.log(
    'New connection from address:',
    req.socket.remoteAddress,
    'port:',
    req.socket.remotePort
  );

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

process.on('SIGINT', () => {
  wss.clients.forEach((socket) => {
    socket.close();
  });

  wss.close();

  console.log('server closed');
});
