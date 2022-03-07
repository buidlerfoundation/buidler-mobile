import AppConfig from 'common/AppConfig';
import store from '../store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AsyncKey} from 'common/AppStorage';
import {actionTypes} from 'actions/actionTypes';
import api from 'services/api';
import {createRefreshSelector} from 'reducers/selectors';

const SocketIO = require('socket.io-client');

const loadMessageIfNeeded = async () => {
  const refreshSelector = createRefreshSelector([actionTypes.MESSAGE_PREFIX]);
  const {currentChannel} = store.getState()?.user;
  const refresh = refreshSelector(store.getState());
  if (!currentChannel || refresh) return;
  store.dispatch({
    type: actionTypes.MESSAGE_FRESH,
    payload: {channelId: currentChannel.channel_id},
  });
  const messageRes = await api.getMessages(currentChannel.channel_id, 20);
  if (messageRes.statusCode === 200) {
    store.dispatch({
      type: actionTypes.MESSAGE_SUCCESS,
      payload: {
        data: messageRes.data,
        channelId: currentChannel.channel_id,
        isFresh: true,
      },
    });
  }
};

class SocketUtil {
  generateId: string = null;
  socket: any = null;
  async init(teamId?: string) {
    const accessToken = await AsyncStorage.getItem(AsyncKey.accessTokenKey);
    this.socket = SocketIO(
      `${AppConfig.baseUrl}`,
      {
        query: {token: accessToken},
      },
      {
        transports: ['websocket'],
        upgrade: false,
        reconnectionAttempts: 5,
        reconnectionDelay: 3000,
      },
    );
    this.socket.on('connect', () => {
      console.log('Connect!!!');
      this.listenSocket();
      this.socket.on('disconnect', (reason: string) => {
        this.socket.off('ON_NEW_MESSAGE');
        this.socket.off('ON_NEW_TASK');
        this.socket.off('ON_UPDATE_TASK');
        this.socket.off('ON_ERROR');
        this.socket.off('ON_EDIT_MESSAGE');
        this.socket.off('ON_USER_ONLINE');
        this.socket.off('ON_USER_OFFLINE');
        this.socket.off('disconnect');
        console.log('Disconnect!!!');
      });
      loadMessageIfNeeded();
      const user: any = store.getState()?.user;
      const {currentTeam} = user || {};
      this.socket.emit('ONLINE', {team_id: teamId || currentTeam?.team_id});
    });
  }
  listenSocket() {
    this.socket.on('ON_USER_ONLINE', (data: any) => {
      store.dispatch({
        type: actionTypes.USER_ONLINE,
        payload: data,
      });
    });
    this.socket.on('ON_USER_OFFLINE', (data: any) => {
      store.dispatch({
        type: actionTypes.USER_OFFLINE,
        payload: data,
      });
    });
    this.socket.on('ON_NEW_MESSAGE', (data: any) => {
      const {message_data, notification_data} = data;
      const {userData, team, currentTeam, channel, currentChannel} =
        store.getState()?.user;
      const messageData: any = store.getState()?.message.messageData;
      if (!currentChannel.channel_id) {
        store.dispatch({
          type: actionTypes.SET_CURRENT_CHANNEL,
          payload: {
            channel: {
              ...currentChannel,
              channel_id: message_data.channel_id,
              user: {
                ...currentChannel.user,
                direct_channel: message_data.channel_id,
              },
            },
          },
        });
        AsyncStorage.setItem(AsyncKey.lastChannelId, message_data.channel_id);
      } else if (
        userData?.user_id !== notification_data?.sender_data?.user_id
      ) {
        if (currentChannel.channel_id !== message_data.channel_id) {
          store.dispatch({
            type: actionTypes.MARK_UN_SEEN_CHANNEL,
            payload: {
              channelId: message_data.channel_id,
            },
          });
        }
        const teamNotification = team.find(
          (t: any) => t.team_id === notification_data.team_id,
        );
        const channelNotification = channel.find(
          (c: any) => c.channel_id === message_data.channel_id,
        );
        if (currentChannel.channel_id === message_data.channel_id) {
          const {scrollData} = messageData?.[currentChannel.channel_id] || {};
          if (scrollData?.showScrollDown) {
            store.dispatch({
              type: actionTypes.SET_CHANNEL_SCROLL_DATA,
              payload: {
                channelId: currentChannel.channel_id,
                data: {
                  showScrollDown: scrollData?.showScrollDown,
                  unreadCount: (scrollData?.unreadCount || 0) + 1,
                },
              },
            });
          }
        }
        if (
          teamNotification &&
          currentChannel.channel_id !== message_data.channel_id
        ) {
          // ipcRenderer.on('notification-click', (_) => {
          //   if (currentTeam.team_id === notification_data.team_id) {
          //     store.dispatch({
          //       type: actionTypes.SET_CURRENT_CHANNEL,
          //       payload: { channel: channelNotification },
          //     });
          //   } else {
          //     this.setTeamFromNotification(
          //       teamNotification,
          //       message_data.channel_id,
          //       store.dispatch
          //     );
          //   }
          // });
        }
      }
      store.dispatch({
        type: actionTypes.RECEIVE_MESSAGE,
        payload: {data: message_data},
      });
    });
    this.socket.on('ON_EDIT_MESSAGE', (data: any) => {
      if (!data) return;
      store.dispatch({
        type: actionTypes.EDIT_MESSAGE,
        payload: {data},
      });
    });
    this.socket.on('ON_NEW_TASK', (data: any) => {
      store.dispatch({
        type: actionTypes.CREATE_TASK_SUCCESS,
        payload: {res: data, channelId: data?.channel?.[0]?.channel_id},
      });
    });
    this.socket.on('ON_UPDATE_TASK', (data: any) => {
      const user: any = store.getState()?.user;
      const {currentChannel} = user || {};
      store.dispatch({
        type: actionTypes.UPDATE_TASK_REQUEST,
        payload: {
          taskId: data.task_id,
          data,
          channelId:
            currentChannel?.user?.direct_channel ||
            data?.channel?.[0]?.channel_id,
          channelUserId:
            data.updated_key === 'assignee_id' &&
            currentChannel?.user?.direct_channel
              ? currentChannel?.user?.user_id
              : null,
        },
      });
    });
    this.socket.on('ON_ERROR', (data: any) => {
      // toast.error(data);
    });
  }
  async changeTeam(teamId: string) {
    if (!this.socket) {
      await this.init(teamId);
      return;
    }
    this.socket.emit('ONLINE', {team_id: teamId});
  }
  sendMessage = (message: {
    channel_id: string;
    text: string;
    message_id?: string;
  }) => {
    this.socket.emit('NEW_MESSAGE', message);
    this.generateId = null;
  };

  setTeamFromNotification = async (
    team: any,
    channelId: string,
    dispatch: any,
  ) => {
    dispatch({
      type: actionTypes.CHANNEL_REQUEST,
    });
    const teamUsersRes = await api.getTeamUsers(team.team_id);
    let lastChannelId = null;
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
    this.changeTeam(team.team_id);
    dispatch({
      type: actionTypes.SET_CURRENT_TEAM,
      payload: {team, resChannel, lastChannelId},
    });
    await AsyncStorage.setItem(AsyncKey.lastTeamId, team.team_id);
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
}

export default new SocketUtil();
