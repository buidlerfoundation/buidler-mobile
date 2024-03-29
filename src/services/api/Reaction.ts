import ApiCaller from './ApiCaller';

export const addReaction = (
  taskId: string,
  data: {emoji_id: string; skin: number},
) => ApiCaller.post(`reaction/${taskId}`, data);

export const removeReaction = (taskId: string, data: {emoji_id: string}) =>
  ApiCaller.delete(`reaction/${taskId}`, data);
