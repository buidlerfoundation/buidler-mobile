import {UserData} from 'models';
import ApiCaller from './ApiCaller';

export const getTeamUsers = (teamId: string, controller?: AbortController) =>
  ApiCaller.get<Array<UserData>>(
    `team/${teamId}/members`,
    undefined,
    controller,
  );
