import ApiCaller from './ApiCaller';

export const loginWithGoogle = (access_token: string) =>
  ApiCaller.post('user', {access_token});

export const findUser = async () => {
  return ApiCaller.get('user');
};

export const findTeam = () => ApiCaller.get('user/team');

export const getGroupChannel = (teamId: string) =>
  ApiCaller.get(`group/${teamId}`);

export const findChannel = (teamId: string) =>
  ApiCaller.get(`channel/${teamId}`);

export const getInitial = () => ApiCaller.get(`initial`);

export const addDeviceToken = (data: {
  device_token: string;
  platform: string;
}) => ApiCaller.post('device_token', data);
