import { randomUUID } from 'crypto';
import { db } from '../db';
import { WebSocket } from 'ws';

export const regHandler = (parsedData: any, ws: WebSocket) => {
  const parsedReqData = JSON.parse(parsedData.data);
  const { name, password } = parsedReqData;
  if (
    name.length < 5 ||
    password.length < 5 ||
    typeof name !== 'string' ||
    typeof password !== 'string'
  ) {
    return {
      type: 'reg',
      data: JSON.stringify({
        name,
        index: 0,
        error: true,
        errorText: 'Invalid reg data',
      }),
    };
  }
  const user = db.find(({ login }) => login === name);

  if (user && user.password !== password) {
    return {
      type: 'reg',
      data: JSON.stringify({
        name,
        index: 0,
        error: true,
        errorText: 'Invalid reg data',
      }),
    };
  } else if (user) {
    user.websocet === ws;
    return {
      type: 'reg',
      data: JSON.stringify({
        name,
        index: user.id,
        error: false,
        errorText: '',
      }),
    };
  } else {
    const playerId = randomUUID();
    db.push({ id: playerId, login: name, password, websocet: ws });
    return {
      type: 'reg',
      data: JSON.stringify({
        name,
        index: playerId,
        error: false,
        errorText: '',
      }),
    };
  }
};
