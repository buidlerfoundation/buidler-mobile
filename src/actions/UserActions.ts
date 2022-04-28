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
import ScreenID from 'common/ScreenID';

export const getInitial: ActionCreator<any> =
  () => async (dispatch: Dispatch) => {
    const res = await api.getInitial();
    ImageHelper.initial(res.img_domain, res.img_config);
    dispatch({type: actionTypes.GET_INITIAL, payload: {data: res}});
  };

export const logout: ActionCreator<any> = () => (dispatch: Dispatch) => {
  dispatch({type: actionTypes.LOGOUT});
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
    dispatch({type: actionTypes.USER_SUCCESS, payload: {user: res}});
  } else {
    dispatch({type: actionTypes.USER_FAIL});
  }
};

export const findTeamAndChannel = () => async (dispatch: Dispatch) => {
  dispatch({type: actionTypes.TEAM_REQUEST});
  const res = await api.findTeam();
  const lastTeamId = await AsyncStorage.getItem(AsyncKey.lastTeamId);
  if (res.statusCode === 200) {
    if (res.data.length > 0) {
      const currentTeam =
        res.data.find((t: any) => t.team_id === lastTeamId) || res.data[0];
      const teamId = currentTeam.team_id;
      const resSpaceChannel = await api.getSpaceChannel(teamId);
      if (resSpaceChannel.statusCode === 200) {
        dispatch({
          type: actionTypes.GROUP_CHANNEL,
          payload: resSpaceChannel.data,
        });
      }
      const resChannel = await api.findChannel(teamId);
      const lastChannelId = await AsyncStorage.getItem(AsyncKey.lastChannelId);
      const teamUsersRes = await api.getTeamUsers(currentTeam.team_id);
      if (teamUsersRes.statusCode === 200) {
        dispatch({
          type: actionTypes.GET_TEAM_USER,
          payload: {
            teamUsers: teamUsersRes.data,
            teamId: currentTeam.team_id,
          },
        });
      }
      SocketUtils.init(currentTeam.team_id);
      const directChannelUser = teamUsersRes?.data?.find(
        (u: any) => u.direct_channel === lastChannelId,
      );
      dispatch({
        type: actionTypes.SET_CURRENT_TEAM,
        payload: {
          team: currentTeam,
          directChannelUser,
          lastChannelId,
          resChannel,
          teamUsersRes,
        },
      });
      if (resChannel.statusCode === 200) {
        if (resChannel.data.length > 0) {
          dispatch({
            type: actionTypes.CHANNEL_SUCCESS,
            payload: {channel: resChannel.data},
          });
        }
      } else {
        dispatch({
          type: actionTypes.CHANNEL_FAIL,
        });
      }
    }
    dispatch({type: actionTypes.TEAM_SUCCESS, payload: {team: res.data}});
  } else {
    dispatch({type: actionTypes.TEAM_FAIL, payload: {message: res}});
    dispatch({
      type: actionTypes.CHANNEL_FAIL,
    });
  }
};

export const setCurrentChannel = (channel: any) => (dispatch: Dispatch) => {
  AsyncStorage.setItem(AsyncKey.lastChannelId, channel.channel_id);
  dispatch({
    type: actionTypes.SET_CURRENT_CHANNEL,
    payload: {channel},
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

export const setCurrentTeam =
  (team: any, channelId?: string) => async (dispatch: Dispatch) => {
    dispatch({
      type: actionTypes.CHANNEL_REQUEST,
    });
    const teamUsersRes = await api.getTeamUsers(team.team_id);
    let lastChannelId: string = null;
    if (channelId) {
      lastChannelId = channelId;
    } else {
      lastChannelId = await AsyncStorage.getItem(AsyncKey.lastChannelId);
    }
    const resChannel = await api.findChannel(team.team_id);
    if (teamUsersRes.statusCode === 200) {
      dispatch({
        type: actionTypes.GET_TEAM_USER,
        payload: {teamUsers: teamUsersRes.data, teamId: team.team_id},
      });
    }
    SocketUtils.changeTeam(team.team_id);
    dispatch({
      type: actionTypes.SET_CURRENT_TEAM,
      payload: {team, resChannel, teamUsersRes, lastChannelId},
    });
    AsyncStorage.setItem(AsyncKey.lastTeamId, team.team_id);
    const resSpaceChannel = await api.getSpaceChannel(team.team_id);
    if (resSpaceChannel.statusCode === 200) {
      dispatch({
        type: actionTypes.GROUP_CHANNEL,
        payload: resSpaceChannel.data,
      });
    }
    if (resChannel.statusCode === 200) {
      if (resChannel.data.length > 0) {
        dispatch({
          type: actionTypes.CHANNEL_SUCCESS,
          payload: {channel: resChannel.data},
        });
      } else {
        dispatch({
          type: actionTypes.CHANNEL_FAIL,
        });
      }
    }
  };

export const accessApp =
  (seed: string, password: string) => async (dispatch: Dispatch) => {
    dispatch({type: actionTypes.ACCESS_APP_REQUEST});
    try {
      const iv = await getIV();
      const {private_key} = await RNGoldenKeystore.createHDKeyPair(
        seed,
        '',
        RNGoldenKeystore.CoinType.ETH.path,
        0,
      );
      dispatch({type: actionTypes.SET_PRIVATE_KEY, payload: private_key});
      const publicKey = utils.computePublicKey(`0x${private_key}`, true);
      const data = {[publicKey]: private_key};
      const encryptedData = encryptString(JSON.stringify(data), password, iv);
      AsyncStorage.setItem(AsyncKey.encryptedDataKey, encryptedData);
      const {nonce, message} = await api.requestNonce(publicKey);
      let err = null;
      if (nonce) {
        const msgHash = utils.hashMessage(nonce);
        const msgHashBytes = utils.arrayify(msgHash);
        const signingKey = new utils.SigningKey(`0x${private_key}`);
        const signature = signingKey.signDigest(msgHashBytes);
        const res = await api.verifyNonce(nonce, signature.compact);
        if (res.statusCode === 200) {
          dispatch({type: actionTypes.ACCESS_APP_SUCCESS, payload: res});
          AsyncStorage.setItem(AsyncKey.accessTokenKey, res.token);
          NavigationServices.reset(ScreenID.SplashScreen);
        } else {
          err = res.message;
        }
      } else {
        err = message;
      }
      if (err) {
        dispatch({type: actionTypes.ACCESS_APP_FAIL, message: err});
      }
    } catch (error) {
      dispatch({type: actionTypes.ACCESS_APP_FAIL, message: error});
    }
  };
