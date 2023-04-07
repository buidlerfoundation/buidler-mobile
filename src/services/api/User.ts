import {
  BalanceApiData,
  Channel,
  CollectibleDataApi,
  Community,
  DAppChain,
  ENSAsset,
  InitialApiData,
  NFTCollectionDataApi,
  NFTDetailDataApi,
  NotificationData,
  Space,
  SpaceCollectionData,
  TransactionApiData,
  UserData,
} from 'models';
import {ConfigNotificationRequestBody} from 'models/request';
import ApiCaller from './ApiCaller';

export const findUser = async () => {
  return ApiCaller.get<UserData>('user');
};

export const findTeam = () => ApiCaller.get<Array<Community>>('user/team');

export const getGroupChannel = (teamId: string) =>
  ApiCaller.get(`group/${teamId}`);

export const getSpaceChannel = (teamId: string, controller?: AbortController) =>
  ApiCaller.get<Array<Space>>(`space/${teamId}`, undefined, controller);

export const findChannel = (teamId: string, controller?: AbortController) =>
  ApiCaller.get<Array<Channel>>(`channel/${teamId}`, undefined, controller);

export const findDirectChannel = (
  status?: 'pending' | 'blocked' | 'accepted' = 'accepted',
  controller?: AbortController,
) => {
  let uri =
    'direct-channel?channel_types[]=Direct&channel_types[]=Multiple Direct';
  if (status) {
    uri += `&status=${status}`;
  }
  return ApiCaller.get<Array<Channel>>(uri, undefined, controller);
};

export const getInitial = () => ApiCaller.get<InitialApiData>('initial');

export const updateChannel = (id: string, data: any) =>
  ApiCaller.put(`channel/${id}`, data);

export const removeTeamMember = (teamId: string, userId: string) =>
  ApiCaller.delete(`team/${teamId}/member`, {user_ids: [userId]});

export const leaveTeam = (teamId: string) =>
  ApiCaller.delete(`team/${teamId}/leave`);

export const updateUserChannel = (channelIds: Array<string>) =>
  ApiCaller.put('user/channel', {channel_ids: channelIds});

export const requestNonce = (pubKey: string) =>
  ApiCaller.post('user/nonce', {public_key: pubKey});

export const requestNonceWithAddress = (address: string) =>
  ApiCaller.post<{message: string}>('user/address', {address});

export const verifyNonce = (message: string, signature: string) =>
  ApiCaller.post<{
    avatar_url: string;
    user_id: string;
    user_name: string;
  }>('user', {message, signature});

export const getCollectibles = (page = 1, limit = 10) => {
  return ApiCaller.get<CollectibleDataApi>(
    `user/nft?page=${page}&limit=${limit}`,
  );
};

export const updateUser = (data: any) => ApiCaller.put('user', data);

export const verifyOtp = (data: any) =>
  ApiCaller.post('user/device/verify', data);

export const syncChannelKey = (data: any) =>
  ApiCaller.post('user/device/sync', data);

export const acceptInvitation = (invitationId: string, ref?: string | null) =>
  ApiCaller.post<Community>(
    `team/invitation/${invitationId}/accept`,
    undefined,
    undefined,
    undefined,
    ref ? {ref} : undefined,
  );

export const removeDevice = (body: any) =>
  ApiCaller.delete('user/device', body);

export const getNFTCollection = () =>
  ApiCaller.get<NFTCollectionDataApi[]>('user/nft-collection');

export const getSpaceMembers = (id: string, controller?: AbortController) =>
  ApiCaller.get<Array<UserData>>(`space/${id}/member`, undefined, controller);

export const getSpaceCondition = (spaceId: string) =>
  ApiCaller.get<Array<SpaceCollectionData>>(`space/${spaceId}/condition`);

export const fetchWalletBalance = () =>
  ApiCaller.get<BalanceApiData>('user/balance');

export const fetchTransaction = (params: {page?: number; limit?: number}) => {
  const {page = 1, limit = 20} = params;
  return ApiCaller.get<Array<TransactionApiData>>(
    `user/transaction?page=${page}&limit=${limit}`,
  );
};

export const fetchNFTCollection = () =>
  ApiCaller.get<{nft_assets: NFTCollectionDataApi[]; ens_assets: ENSAsset[]}>(
    'user/nft-collection/group',
  );

export const getUserDetail = (userId: string, teamId: string) =>
  ApiCaller.get<UserData>(`user/${userId}/team/${teamId}`);

export const importToken = (address: string) =>
  ApiCaller.post<Token>(`user/balance/${address}`);

export const searchToken = (address: string) =>
  ApiCaller.get<Contract>(`contract/${address}`);

export const findUserByAddress = (params: {
  address?: string;
  username?: string;
}) => {
  let url = 'user/search';
  if (params.address) {
    url += `?address=${params.address}`;
  } else if (params.username) {
    url += `?username=${params.username}`;
  }
  return ApiCaller.get<Array<UserData>>(url);
};

export const getTokenPrice = (contractAddress: string) =>
  ApiCaller.get<TokenPrice>(`price/${contractAddress}`);

export const getGasPrice = () => ApiCaller.get<number>('price/gas');

export const getGasLimit = tx =>
  ApiCaller.post<number>('price/estimate/gas', tx);

export const getMembersByRole = (
  teamId: string,
  roles: Array<UserRoleType> = [],
  params: {
    userName?: string;
    page?: number;
  } = {},
) => {
  const {userName, page} = params;
  let url = `team/${teamId}/role?page=${page || 1}&limit=30`;
  roles.forEach(el => {
    url += `&roles[]=${el}`;
  });
  if (userName) {
    url += `&username=${userName}`;
  }
  return ApiCaller.get<Array<UserData>>(url);
};

export const modifyRole = (
  teamId: string,
  role: string,
  body: {user_ids_to_add?: Array<string>; user_ids_to_remove?: Array<string>},
) => {
  return ApiCaller.put(`team/${teamId}/${role}`, body);
};

export const addPendingTx = (tx: TransactionApiData) =>
  ApiCaller.post<TransactionApiData>('user/transaction', tx);

export const addDeviceToken = (data: {
  device_token: string;
  platform: string;
}) => ApiCaller.post('device_token', data);

export const refreshToken = (token: string) => {
  return ApiCaller.post<{
    token: string;
    token_expire_at: number;
    refresh_token: string;
    refresh_token_expire_at: number;
  }>('user/refresh', undefined, undefined, undefined, {
    'Refresh-Token': token,
  });
};

export const invitation = (teamId: string) =>
  ApiCaller.post<{invitation_url: string}>(`team/invitation/${teamId}/members`);

export const blockUser = (userId: string) =>
  ApiCaller.post(`user-relationship/block/${userId}`);

export const unblockUser = (userId: string) =>
  ApiCaller.delete(`user-relationship/block/${userId}`);

export const deleteUser = () => ApiCaller.delete('user');

export const getNotification = (
  filterType: NotificationFilterType,
  before?: string,
) => {
  let uri = 'notifications?page[size]=20';
  if (filterType === 'Mention') {
    uri +=
      '&notification_types[]=channel_mention&notification_types[]=post_mention';
  } else if (filterType === 'Unread') {
    uri += '&is_read=false';
  }
  if (before) {
    uri += `&page[before]=${before}`;
  }
  return ApiCaller.get<NotificationData[]>(uri);
};

export const readNotification = (notificationId: string) =>
  ApiCaller.put(`notifications/${notificationId}`);

export const readAllNotification = () => ApiCaller.put('notifications');

export const deleteNotification = (notificationId: string) =>
  ApiCaller.delete(`notifications/${notificationId}`);

export const configNotificationFromTask = (
  pinPostId: string,
  data: ConfigNotificationRequestBody,
) => ApiCaller.post(`notifications/task/${pinPostId}`, data);

export const getNFTsDetails = (
  contractAddresses: string[],
  tokenIds: string[],
  networks: string[],
) => {
  let uri = 'user/nft?';
  contractAddresses.forEach(
    address => (uri += `contract_addresses[]=${address}&`),
  );
  tokenIds.forEach(id => (uri += `token_ids[]=${id}&`));
  networks.forEach(network => (uri += `networks[]=${network}&`));
  return ApiCaller.get<NFTDetailDataApi[]>(uri);
};

export const requestOTT = () => ApiCaller.get<string>('authentication/ott');

export const getChains = () => ApiCaller.get<DAppChain[]>('chains');
