interface WSResponse {
  type: string;
  data: string | any;
}

export const responseHandler = (response: WSResponse) => {
  const { type, data } = response;
  switch (type) {
    case 'reg':
      const result = JSON.stringify({ type, data, id: 0 });
      return result;
    case 'create_game':
      const resultCreate = JSON.stringify({ type, data, id: 0 });
      return resultCreate;
    case 'update_room':
      const resultUpdated = JSON.stringify({ type, data, id: 0 });
      return resultUpdated;
  }
};
