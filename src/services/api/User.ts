import ApiCaller from './ApiCaller';

export const loginWithGoogle = (access_token: string) =>
  ApiCaller.post('user', {access_token});

export const findUser = async () => {
  return ApiCaller.get('user');
};

export const findTeam = () => ApiCaller.get('user/team');

export const getSpaceChannel = (teamId: string) =>
  ApiCaller.get(`space/${teamId}`);

export const findChannel = (teamId: string) =>
  ApiCaller.get(`channel/${teamId}`);

export const getInitial = () => ApiCaller.get(`initial`);

export const addDeviceToken = (data: {
  device_token: string;
  platform: string;
}) => ApiCaller.post('device_token', data);

export const requestNonce = (pubKey: string) =>
  ApiCaller.post('user/nonce', {public_key: pubKey});

export const requestNonceWithAddress = (address: string) =>
  ApiCaller.post('user/address', {address});

export const verifyNonce = (message: string, signature: string) =>
  ApiCaller.post('user', {message, signature});

export const verifyOtp = (data: any) =>
  ApiCaller.post('user/device/verify', data);

export const syncChannelKey = (data: any) =>
  ApiCaller.post('user/device/sync', data);
