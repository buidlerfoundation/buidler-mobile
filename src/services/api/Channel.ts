import ApiCaller from './ApiCaller';

// {
//   "channel_name": "HungTest"
// }
export const createChanel = (teamId: string, body: any) =>
  ApiCaller.post(`channel/${teamId}`, body);

export const getChannels = (teamId: string) =>
  ApiCaller.get(`channel/${teamId}`);

export const updateChannel = (id: string, body: any) =>
  ApiCaller.put(`channel/${id}`, body);
