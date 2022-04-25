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

export const requestNonce = (pubKey: string) =>
  ApiCaller.post('user/nonce', {public_key: pubKey});

export const verifyNonce = (nonce: string, signature: string) =>
  ApiCaller.post('user/verify', {nonce, signature});

export const verifyOtp = (data: any) =>
  ApiCaller.post('user/device/verify', data);

export const syncChannelKey = (data: any) =>
  ApiCaller.post('user/device/sync', data);
