import {Channel} from 'models';
import ApiCaller from './ApiCaller';

export const createChannel = (teamId: string, body: any) =>
  ApiCaller.post<Channel>(`channel/${teamId}`, body);
