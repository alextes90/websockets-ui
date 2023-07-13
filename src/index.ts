import { httpServer } from './http_server/index';
import { wss } from './websocketServer';

const HTTP_PORT = 8181;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);
console.log(`Web Socket Server started on port ${wss.options.port}`);
