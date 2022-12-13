import ImageHelper from 'helpers/ImageHelper';
import {ActionCreator, Dispatch} from 'redux';
import api from 'services/api';
import SocketUtils from '../utils/SocketUtils';
import {actionTypes} from './actionTypes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AsyncKey} from 'common/AppStorage';
import messaging from '@react-native-firebase/messaging';
import {Platform} from 'react-native';
import {encryptString, getIV} from 'utils/DataCrypto';
import {utils} from 'ethers';
import RNGoldenKeystore from 'react-native-golden-keystore';
import NavigationServices from 'services/NavigationServices';
import ScreenID, {StackID} from 'common/ScreenID';
import {isValidPrivateKey} from 'helpers/SeedHelper';
import {AppGetState} from 'store';
import PushNotificationHelper from 'helpers/PushNotificationHelper';
import Toast from 'react-native-toast-message';
import {getDeviceCode} from 'helpers/GenerateUUID';
import {UserRole} from 'common/AppConfig';
import MixpanelAnalytics from 'services/analytics/MixpanelAnalytics';
import {Channel} from 'models';
import {getPrivateChannel} from 'helpers/ChannelHelper';
import notifee from '@notifee/react-native';

export const getInitial: ActionCreator<any> =
  () => async (dispatch: Dispatch) => {
    const res = await api.getInitial();
    if (res.statusCode === 200) {
      ImageHelper.initial(
        res.data?.imgproxy.domain || '',
        res.data?.imgproxy?.bucket_name || '',
      );
      dispatch({type: actionTypes.GET_INITIAL, payload: {data: res.data}});
    } else {
      throw res.message;
    }
  };

export const logout: ActionCreator<any> = () => async (dispatch: Dispatch) => {
  notifee.cancelAllNotifications();
  const deviceCode = await getDeviceCode();
  api.removeDevice({
    device_code: deviceCode,
  });
  await AsyncStorage.clear();
  SocketUtils.disconnect();
  dispatch({type: actionTypes.LOGOUT});
};

export const refreshToken = () => async (dispatch: Dispatch) => {
  dispatch({type: actionTypes.REFRESH_TOKEN_REQUEST});
  try {
    const refreshToken = await AsyncStorage.getItem(AsyncKey.refreshTokenKey);
    const refreshTokenRes = await api.refreshToken(refreshToken);
    if (refreshTokenRes.success) {
      await AsyncStorage.setItem(
        AsyncKey.accessTokenKey,
        refreshTokenRes?.data?.token,
      );
      await AsyncStorage.setItem(
        AsyncKey.refreshTokenKey,
        refreshTokenRes?.data?.refresh_token,
      );
      await AsyncStorage.setItem(
        AsyncKey.tokenExpire,
        refreshTokenRes?.data?.token_expire_at?.toString(),
      );
      await AsyncStorage.setItem(
        AsyncKey.refreshTokenExpire,
        refreshTokenRes?.data?.refresh_token_expire_at?.toString(),
      );
      dispatch({
        type: actionTypes.REFRESH_TOKEN_SUCCESS,
        payload: refreshTokenRes,
      });
    } else {
      MixpanelAnalytics.tracking('Refresh failed', {
        message: refreshTokenRes.message || 'Some thing wrong',
      });
      dispatch({
        type: actionTypes.REFRESH_TOKEN_FAIL,
        payload: refreshTokenRes,
      });
    }
    return refreshTokenRes.success;
  } catch (error) {
    MixpanelAnalytics.tracking('Refresh failed', {
      message: error.message || error,
    });
    dispatch({type: actionTypes.REFRESH_TOKEN_FAIL, payload: error});
    return false;
  }
};

export const login: ActionCreator<any> =
  (access_token, callback: (res: boolean) => void) =>
  async (dispatch: Dispatch) => {
    dispatch({type: actionTypes.LOGIN_REQUEST});
    const res = await api.loginWithGoogle(access_token);
    if (res.statusCode === 200) {
      await AsyncStorage.setItem(AsyncKey.accessTokenKey, res.token);
      const deviceToken = await messaging().getToken();
      console.log('Device Token: ', deviceToken);
      await api.addDeviceToken({
        device_token: deviceToken,
        platform: Platform.OS === 'ios' ? 'iOS' : 'Android',
      });
      // TODO: call api fetch user profile with token
      dispatch({type: actionTypes.LOGIN_SUCCESS});
      dispatch({type: actionTypes.USER_SUCCESS, payload: {user: res.data}});
      callback(true);
    } else {
      dispatch({type: actionTypes.LOGIN_FAIL});
      callback(false);
    }
  };

export const findUser = () => async (dispatch: Dispatch) => {
  dispatch({type: actionTypes.USER_REQUEST});
  const res = await api.findUser();
  if (res.statusCode === 200) {
    actionFetchWalletBalance(dispatch);
    dispatch({type: actionTypes.USER_SUCCESS, payload: {user: res.data}});
  } else {
    dispatch({type: actionTypes.USER_FAIL, payload: res});
  }
};

export const findTeamAndChannel =
  (initCommunityId?: string) => async (dispatch: Dispatch) => {
    dispatch({type: actionTypes.TEAM_REQUEST, payload: {initCommunityId}});
    const res = await api.findTeam();
    let lastTeamId = '';
    if (initCommunityId && initCommunityId !== 'user') {
      lastTeamId = initCommunityId;
    } else {
      lastTeamId = await AsyncStorage.getItem(AsyncKey.lastTeamId);
    }
    if (res.statusCode === 200) {
      const communities = res.data || [];
      if (communities.length > 0) {
        const currentTeam =
          communities.find((t: Community) => t.team_id === lastTeamId) ||
          communities[0];
        const teamId = currentTeam.team_id;
        const lastChannelId = await AsyncStorage.getItem(
          AsyncKey.lastChannelId,
        );
        const lastDirectChannelId = await AsyncStorage.getItem(
          AsyncKey.lastDirectChannelId,
        );
        const [
          resSpace,
          resChannel,
          resDirectChannel,
          teamUsersRes,
          directChannelUsersRes,
        ] = await Promise.all([
          api.getSpaceChannel(teamId),
          api.findChannel(teamId),
          api.findDirectChannel(),
          api.getTeamUsers(currentTeam.team_id),
          api.getDirectChannelUsers(),
        ]);

        if (teamUsersRes.statusCode === 200) {
          dispatch({
            type: actionTypes.GET_TEAM_USER,
            payload: {
              teamUsers: teamUsersRes,
              teamId: currentTeam.team_id,
            },
          });
        }
        SocketUtils.init();
        dispatch({
          type: actionTypes.CURRENT_TEAM_SUCCESS,
          payload: {
            team: currentTeam,
            lastChannelId,
            resChannel,
            teamUsersRes,
            resSpace,
            resDirectChannel,
            directChannelUsersRes,
            lastDirectChannelId,
          },
        });
      } else {
        SocketUtils.init();
      }
      dispatch({type: actionTypes.TEAM_SUCCESS, payload: {team: res.data}});
    } else {
      dispatch({type: actionTypes.TEAM_FAIL, payload: {message: res}});
      dispatch({
        type: actionTypes.CHANNEL_FAIL,
      });
    }
  };

export const setCurrentChannel =
  (channel: any) => async (dispatch: Dispatch) => {
    await AsyncStorage.setItem(AsyncKey.lastChannelId, channel.channel_id);
    dispatch({
      type: actionTypes.SET_CURRENT_CHANNEL,
      payload: {channel},
    });
  };

export const setCurrentDirectChannel =
  (directChannel: Channel) => async (dispatch: Dispatch) => {
    await AsyncStorage.setItem(
      AsyncKey.lastDirectChannelId,
      directChannel.channel_id,
    );
    dispatch({
      type: actionTypes.SET_CURRENT_DIRECT_CHANNEL,
      payload: {directChannel},
    });
  };

export const createNewChannel =
  (teamId: string, body: any, groupName: string) =>
  async (dispatch: Dispatch) => {
    dispatch({
      type: actionTypes.CREATE_CHANNEL_REQUEST,
      payload: {teamId, body},
    });
    const res = await api.createChannel(teamId, body);
    if (res.statusCode === 200) {
      dispatch({
        type: actionTypes.CREATE_CHANNEL_SUCCESS,
        payload: {
          ...res,
          group_channel: {
            group_channel_name: groupName,
          },
        },
      });
    } else {
      dispatch({
        type: actionTypes.CREATE_CHANNEL_FAIL,
        payload: res,
      });
    }
  };

const actionSetCurrentTeam = async (
  team: any,
  dispatch: Dispatch,
  channelId?: string,
  getState?: any,
) => {
  const lastController = getState?.().user?.apiTeamController;
  lastController?.abort?.();
  // eslint-disable-next-line no-undef
  const controller = new AbortController();
  dispatch({
    type: actionTypes.CURRENT_TEAM_REQUEST,
    payload: {controller, team},
  });
  try {
    let lastChannelId: any = null;
    const [resSpace, resChannel, teamUsersRes] = await Promise.all([
      api.getSpaceChannel(team.team_id, controller),
      api.findChannel(team.team_id, controller),
      api.getTeamUsers(team.team_id, controller),
    ]);
    const lastChannel = getState?.().user?.lastChannel?.[team.team_id];
    if (channelId) {
      lastChannelId = channelId;
    } else if (lastChannel) {
      lastChannelId = lastChannel.channel_id;
    } else {
      lastChannelId = resChannel.data?.find(
        el => el.channel_type !== 'Direct',
      )?.[0]?.channel_id;
    }
    if (lastChannelId) {
      await AsyncStorage.setItem(AsyncKey.lastChannelId, lastChannelId);
    }
    const lastDirectChannelId = await AsyncStorage.getItem(
      AsyncKey.lastDirectChannelId,
    );
    if (teamUsersRes.statusCode === 200) {
      dispatch({
        type: actionTypes.GET_TEAM_USER,
        payload: {teamUsers: teamUsersRes, teamId: team.team_id},
      });
    }
    SocketUtils.changeTeam();
    dispatch({
      type: actionTypes.CURRENT_TEAM_SUCCESS,
      payload: {team, resChannel, lastChannelId, resSpace, lastDirectChannelId},
    });
    AsyncStorage.setItem(AsyncKey.lastTeamId, team.team_id);
  } catch (error) {
    dispatch({
      type: actionTypes.CURRENT_TEAM_FAIL,
      payload: {message: error},
    });
  }
};

export const setCurrentTeam =
  (team: any, channelId?: string) => async (dispatch: Dispatch, getState) =>
    actionSetCurrentTeam(team, dispatch, channelId, getState);

export const accessApp =
  (seed: string, password: string, isLater?: boolean) =>
  async (dispatch: Dispatch) => {
    dispatch({type: actionTypes.ACCESS_APP_REQUEST});
    try {
      const iv = await getIV();
      let private_key;
      if (isValidPrivateKey(seed)) {
        private_key = seed;
      } else {
        private_key = (
          await RNGoldenKeystore.createHDKeyPair(
            seed,
            '',
            RNGoldenKeystore.CoinType.ETH.path,
            0,
          )
        ).private_key;
      }
      dispatch({type: actionTypes.SET_PRIVATE_KEY, payload: private_key});
      const publicKey = utils.computePublicKey(`0x${private_key}`, true);
      if (isLater) {
        const dataSeed = {[publicKey]: seed};
        const encryptedDataSeed = encryptString(
          JSON.stringify(dataSeed),
          password,
          iv,
        );
        AsyncStorage.setItem(AsyncKey.encryptedSeedKey, encryptedDataSeed);
      }
      const data = {[publicKey]: private_key};
      const address = utils.computeAddress(publicKey);
      const encryptedData = encryptString(JSON.stringify(data), password, iv);
      AsyncStorage.setItem(AsyncKey.encryptedDataKey, encryptedData);
      const nonceRes = await api.requestNonceWithAddress(address);
      let err = null;
      if (nonceRes.success) {
        const msgHash = utils.hashMessage(nonceRes.data.message);
        const msgHashBytes = utils.arrayify(msgHash);
        const signingKey = new utils.SigningKey(`0x${private_key}`);
        const signature = signingKey.signDigest(msgHashBytes);
        const res = await api.verifyNonce(
          nonceRes.data.message,
          signature.compact,
        );
        if (res.statusCode === 200) {
          await AsyncStorage.setItem(AsyncKey.accessTokenKey, res.token);
          await AsyncStorage.setItem(
            AsyncKey.refreshTokenKey,
            res.refresh_token,
          );
          await AsyncStorage.setItem(
            AsyncKey.tokenExpire,
            res.token_expire_at?.toString(),
          );
          await AsyncStorage.setItem(
            AsyncKey.refreshTokenExpire,
            res.refresh_token_expire_at?.toString(),
          );
          const privateKeyChannel = await getPrivateChannel(private_key);
          dispatch({
            type: actionTypes.SET_CHANNEL_PRIVATE_KEY,
            payload: privateKeyChannel,
          });
          dispatch({type: actionTypes.ACCESS_APP_SUCCESS, payload: res});
          NavigationServices.reset(ScreenID.SplashScreen);
        } else {
          err = res.message;
        }
      } else {
        err = nonceRes.message;
      }
      if (err) {
        dispatch({type: actionTypes.ACCESS_APP_FAIL, message: err});
      }
    } catch (error) {
      dispatch({type: actionTypes.ACCESS_APP_FAIL, message: error});
    }
  };

export const actionFetchWalletBalance = async (dispatch: Dispatch) => {
  dispatch({type: actionTypes.WALLET_BALANCE_REQUEST});
  try {
    const res = await api.fetchWalletBalance();
    if (res.statusCode === 200) {
      dispatch({type: actionTypes.WALLET_BALANCE_SUCCESS, payload: res.data});
    } else {
      dispatch({
        type: actionTypes.WALLET_BALANCE_FAIL,
        payload: {message: res.message},
      });
    }
  } catch (error: any) {
    dispatch({
      type: actionTypes.WALLET_BALANCE_FAIL,
      payload: {message: error.message},
    });
  }
};

export const fetchWalletBalance = () => async (dispatch: Dispatch) =>
  actionFetchWalletBalance(dispatch);

export const acceptInvitation = (url: string) => async (dispatch: Dispatch) => {
  const lastIndex = url.lastIndexOf('/');
  const invitationId = url.substring(lastIndex + 1);
  const inviteRes = await api.acceptInvitation(invitationId);
  if (inviteRes.success) {
    Toast.show({
      type: 'customSuccess',
      props: {message: 'You have successfully joined new community.'},
    });
    dispatch({type: actionTypes.ACCEPT_TEAM_SUCCESS, payload: inviteRes.data});
    await dispatch(setCurrentTeam(inviteRes.data));
    NavigationServices.pushToScreen(ScreenID.ConversationScreen, {
      openDrawer: true,
    });
  }
};

export const accessToHome =
  () => async (dispatch: Dispatch, getState: AppGetState) => {
    const dataFromUrl = getState()?.configs?.dataFromUrl;
    let invitationCommunity = null;
    if (dataFromUrl) {
      dispatch({type: actionTypes.SET_DATA_FROM_URL, payload: ''});
      const lastIndex = dataFromUrl.lastIndexOf('/');
      const invitationId = dataFromUrl.substring(lastIndex + 1);
      const inviteRes = await api.acceptInvitation(invitationId);
      if (inviteRes.success) {
        invitationCommunity = inviteRes.data;
      }
    }
    await dispatch(findTeamAndChannel());
    const {team, currentTeamId, channelMap} = getState()?.user;
    let params = {};
    if (invitationCommunity) {
      Toast.show({
        type: 'customSuccess',
        props: {message: 'You have successfully joined new community.'},
      });
      params = {
        openDrawer: true,
      };
      await dispatch(setCurrentTeam(invitationCommunity));
    } else if (
      PushNotificationHelper.initialNotification &&
      PushNotificationHelper.initNotificationData
    ) {
      const channels = channelMap?.[currentTeamId];
      const {data, type} = PushNotificationHelper.initNotificationData;
      const {team_id, channel_type} = data.notification_data;
      const {entity_id, entity_type, message_id} = data.message_data;
      const direct = channel_type === 'Direct';
      params = {
        type,
        entity_id,
        entity_type,
        direct,
        jumpMessageId: message_id,
      };
      const teamNotification = team?.find?.(t => t.team_id === team_id);
      const channelNotification = channels.find(
        el => el.channel_id === entity_id,
      );
      if (direct) {
        await dispatch(setCurrentDirectChannel({channel_id: entity_id}));
      } else if (currentTeamId === team_id) {
        if (channelNotification) {
          await dispatch(setCurrentChannel(channelNotification));
        }
      } else if (teamNotification) {
        await dispatch(setCurrentTeam(teamNotification, entity_id));
      }
      PushNotificationHelper.reset();
    }
    NavigationServices.replace(StackID.HomeStack, params);
  };

export const leaveTeam = (teamId: string) => async (dispatch: Dispatch) => {
  dispatch({
    type: actionTypes.LEAVE_TEAM_REQUEST,
    payload: {teamId},
  });
  const res = await api.leaveTeam(teamId);
  if (res.statusCode !== 200) {
    dispatch({
      type: actionTypes.LEAVE_TEAM_FAIL,
      payload: res,
    });
  }
  return res.statusCode === 200;
};

export const getMemberData =
  (teamId: string, role: UserRoleType, page: number) =>
  async (dispatch: Dispatch) => {
    if (page > 1) {
      dispatch({
        type: actionTypes.MEMBER_DATA_MORE,
        payload: {teamId, role, page},
      });
    } else {
      dispatch({
        type: actionTypes.MEMBER_DATA_REQUEST,
        payload: {teamId, role, page},
      });
    }
    const roles = role === UserRole.Member ? Object.values(UserRole) : [role];
    const res = await api.getMembersByRole(teamId, roles, {page});
    if (res.success) {
      dispatch({
        type: actionTypes.MEMBER_DATA_SUCCESS,
        payload: {role, page, data: res.data, total: res.metadata?.total},
      });
    } else {
      dispatch({
        type: actionTypes.MEMBER_DATA_FAIL,
        payload: res,
      });
    }
  };

export const syncDirectChannelData = () => async (dispatch: Dispatch) => {
  const [resDirectChannel, directChannelUsersRes] = await Promise.all([
    api.findDirectChannel(),
    api.getDirectChannelUsers(),
  ]);
  dispatch({
    type: actionTypes.SYNC_DIRECT_CHANNEL_DATA,
    payload: {resDirectChannel, directChannelUsersRes},
  });
  return (
    resDirectChannel.statusCode === 200 &&
    directChannelUsersRes.statusCode === 200
  );
};
