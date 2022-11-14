import {Channel} from 'models';
import {ConfigNotificationRequestBody} from 'models/request';
import ApiCaller from './ApiCaller';

export const createChannel = (teamId: string, body: any) =>
  ApiCaller.post<Channel>(`channel/${teamId}`, body);

export const updateChannelNotification = (
  channelId: string,
  data: ConfigNotificationRequestBody,
) => {
  return ApiCaller.post(`channel/${channelId}/notification`, data);
};
