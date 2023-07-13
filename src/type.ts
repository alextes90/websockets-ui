import { UUID } from 'crypto';

export interface User {
  id: UUID;
  login: string;
  password: string;
}

export interface Rooms {
  roomId: UUID;
  roomUsers: InGameUserr[];
}
interface InGameUserr {
  name: string;
  index: UUID;
}
