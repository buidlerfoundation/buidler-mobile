import ImageHelper from 'helpers/ImageHelper';
import {ActionCreator, Dispatch} from 'redux';
import api from 'services/api';
import SocketUtils from '../utils/SocketUtils';
import {actionTypes} from './actionTypes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AsyncKey} from 'common/AppStorage';
import messaging from '@react-native-firebase/messaging';
import {Platform} from 'react-native';

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
      const resGroupChannel = await api.getGroupChannel(teamId);
      if (resGroupChannel.statusCode === 200) {
        dispatch({
          type: actionTypes.GROUP_CHANNEL,
          payload: resGroupChannel.data,
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
    const directChannelUser = teamUsersRes?.data?.find(
      (u: any) => u.direct_channel === lastChannelId,
    );
    dispatch({
      type: actionTypes.SET_CURRENT_TEAM,
      payload: {team, resChannel, directChannelUser, lastChannelId},
    });
    AsyncStorage.setItem(AsyncKey.lastTeamId, team.team_id);
    const resGroupChannel = await api.getGroupChannel(team.team_id);
    if (resGroupChannel.statusCode === 200) {
      dispatch({
        type: actionTypes.GROUP_CHANNEL,
        payload: resGroupChannel.data,
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
