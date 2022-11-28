import {UserData} from 'models';
import ApiCaller from './ApiCaller';

export const getTeamUsers = (teamId: string, controller?: AbortController) =>
  ApiCaller.get<Array<UserData>>(
    `team/${teamId}/members`,
    undefined,
    controller,
  );

export const getDirectChannelUsers = () =>
  ApiCaller.get<UserData[]>(
    'direct-channel/members?channel_types[]=Direct&channel_types[]=Multiple Direct',
  );
