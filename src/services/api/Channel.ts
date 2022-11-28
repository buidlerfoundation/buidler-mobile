import {Channel, ChannelKeyApiData} from 'models';
import {
  ConfigNotificationRequestBody,
  DirectChannelRequestBody,
} from 'models/request';
import ApiCaller from './ApiCaller';

export const createChannel = (teamId: string, body: any) =>
  ApiCaller.post<Channel>(`channel/${teamId}`, body);

export const updateChannelNotification = (
  channelId: string,
  data: ConfigNotificationRequestBody,
) => {
  return ApiCaller.post(`channel/${channelId}/notification`, data);
};

export const createDirectChannel = (
  teamId: string,
  requestBody: DirectChannelRequestBody,
) => {
  return ApiCaller.post<Channel>(`channel/${teamId}`, requestBody);
};

export const getChannelKey = (timestamp?: number | string = 0) =>
  ApiCaller.get<ChannelKeyApiData[]>(`channel-key?timestamp=${timestamp}`);
