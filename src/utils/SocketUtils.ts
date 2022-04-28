import AppConfig from 'common/AppConfig';
import store from '../store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AsyncKey} from 'common/AppStorage';
import {actionTypes} from 'actions/actionTypes';
import api from 'services/api';
import {createRefreshSelector} from 'reducers/selectors';
import {getDeviceCode} from 'helpers/GenerateUUID';
import {
  getChannelPrivateKey,
  getPrivateChannel,
  getRawPrivateChannel,
  normalizeMessageData,
  storePrivateChannel,
} from 'helpers/ChannelHelper';
import {Dispatch} from 'redux';

const SocketIO = require('socket.io-client');

const getTasks = async (channelId: string, dispatch: Dispatch) => {
  dispatch({type: actionTypes.TASK_REQUEST, payload: {channelId}});
  try {
    const [taskRes, archivedCountRes] = await Promise.all([
      api.getTasks(channelId),
      api.getArchivedTaskCount(channelId),
    ]);
    if (taskRes.statusCode === 200 && archivedCountRes.statusCode === 200) {
      dispatch({
        type: actionTypes.TASK_SUCCESS,
        payload: {
          channelId,
          tasks: taskRes.data,
          archivedCount: archivedCountRes.total,
        },
      });
    } else {
      dispatch({
        type: actionTypes.TASK_FAIL,
        payload: {message: 'Error', taskRes, archivedCountRes},
      });
    }
  } catch (e) {
    dispatch({type: actionTypes.TASK_FAIL, payload: {message: e}});
  }
};

const getTaskFromUser = async (
  userId: string,
  channelId: string,
  teamId: string,
  dispatch: Dispatch,
) => {
  dispatch({type: actionTypes.TASK_REQUEST, payload: {channelId}});
  try {
    const [taskRes, archivedCountRes] = await Promise.all([
      api.getTaskFromUser(userId, teamId),
      api.getArchivedTaskCountFromUser(userId, teamId),
    ]);
    if (taskRes.statusCode === 200 && archivedCountRes.statusCode === 200) {
      dispatch({
        type: actionTypes.TASK_SUCCESS,
        payload: {
          channelId,
          tasks: taskRes.data,
          archivedCount: archivedCountRes.total,
        },
      });
    } else {
      dispatch({
        type: actionTypes.TASK_FAIL,
        payload: {message: 'Error', taskRes, archivedCountRes},
      });
    }
  } catch (e) {
    dispatch({type: actionTypes.TASK_FAIL, payload: {message: e}});
  }
};

const getMessages = async (
  channelId: string,
  channelType: string,
  dispatch: Dispatch,
) => {
  const messageRes = await api.getMessages(channelId, 50);
  const isPrivate = channelType === 'Private' || channelType === 'Direct';
  const messageData = isPrivate
    ? await normalizeMessageData(messageRes.data, channelId)
    : messageRes.data;
  if (messageRes.statusCode === 200) {
    dispatch({
      type: actionTypes.MESSAGE_SUCCESS,
      payload: {data: messageData, channelId},
    });
  }
};

const actionSetCurrentTeam = async (
  team: any,
  dispatch: Dispatch,
  channelId?: string,
) => {
  const teamUsersRes = await api.getTeamUsers(team.team_id);
  let lastChannelId: any = null;
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
  const directChannelUser = teamUsersRes?.data?.find(
    (u: any) => u.direct_channel === lastChannelId,
  );
  dispatch({
    type: actionTypes.SET_CURRENT_TEAM,
    payload: {team, resChannel, directChannelUser, lastChannelId},
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
        payload: {
          channel: resChannel.data.map((c: any) => {
            if (c.channel_id === lastChannelId) {
              c.seen = true;
            }
            return c;
          }),
        },
      });
    } else {
      dispatch({
        type: actionTypes.CHANNEL_FAIL,
      });
    }
  }
};

class SocketUtil {
  generateId: string = null;
  socket: any = null;
  firstLoad = false;
  async init(teamId?: string) {
    const accessToken = await AsyncStorage.getItem(AsyncKey.accessTokenKey);
    this.socket = SocketIO(
      `${AppConfig.stagingBaseUrl}`,
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
      if (this.firstLoad) {
        this.reloadData();
      }
      this.firstLoad = true;
      this.listenSocket();
      this.socket.on('disconnect', (reason: string) => {
        this.socket.off('ON_NEW_MESSAGE');
        this.socket.off('ON_NEW_TASK');
        this.socket.off('ON_UPDATE_TASK');
        this.socket.off('ON_ERROR');
        this.socket.off('ON_EDIT_MESSAGE');
        this.socket.off('ON_USER_ONLINE');
        this.socket.off('ON_USER_OFFLINE');
        this.socket.off('ON_DELETE_TASK');
        this.socket.off('ON_DELETE_MESSAGE');
        this.socket.off('ON_REACTION_ADDED');
        this.socket.off('ON_REACTION_REMOVED');
        this.socket.off('ON_USER_JOIN_TEAM');
        this.socket.off('ON_CREATE_NEW_CHANNEL');
        this.socket.off('ON_UPDATE_MEMBER_IN_PRIVATE_CHANNEL');
        this.socket.off('ON_CHANNEL_KEY_SEND');
        this.socket.off('ON_VERIFY_DEVICE_OTP_SEND');
        this.socket.off('ON_SYNC_DATA_SEND');
        this.socket.off('disconnect');
        console.log('Disconnect!!!');
      });
      const user: any = store.getState()?.user;
      const {currentTeam} = user || {};
      this.emitOnline(teamId || currentTeam?.team_id);
    });
  }
  async emitOnline(teamId: string) {
    const deviceCode = await getDeviceCode();
    this.socket.emit('ONLINE', {team_id: teamId, device_code: deviceCode});
  }
  async emitReceivedKey(channelId: string, timestamp: number) {
    const deviceCode = await getDeviceCode();
    this.socket.emit('ON_CHANNEL_KEY_RECEIVED', {
      channel_id: channelId,
      device_code: deviceCode,
      timestamp,
    });
  }
  reloadData = () => {
    const user: any = store.getState()?.user;
    const {currentTeam, currentChannel} = user;
    if (currentTeam && currentChannel) {
      actionSetCurrentTeam(
        currentTeam,
        store.dispatch,
        currentChannel.channel_id,
      );
      // load message
      getMessages(
        currentChannel.channel_id,
        currentChannel.channel_type,
        store.dispatch,
      );
      // load task
      if (currentChannel?.user) {
        getTaskFromUser(
          currentChannel.user.user_id,
          currentChannel.channel_id || currentChannel.user.user_id,
          currentTeam?.team_id,
          store.dispatch,
        );
      } else {
        getTasks(currentChannel.channel_id, store.dispatch);
      }
    }
  };
  handleChannelPrivateKey = async (
    channel_id: string,
    key: string,
    timestamp: number,
  ) => {
    const configs: any = store.getState()?.configs;
    const {channelPrivateKey, privateKey} = configs;
    const decrypted = await getChannelPrivateKey(key, privateKey);
    storePrivateChannel(channel_id, key, timestamp);
    this.emitReceivedKey(channel_id, timestamp);
    store.dispatch({
      type: actionTypes.SET_CHANNEL_PRIVATE_KEY,
      payload: {
        ...channelPrivateKey,
        [channel_id]: [
          ...(channelPrivateKey?.[channel_id] || []),
          {key: decrypted, timestamp},
        ],
      },
    });
  };
  listenSocket() {
    this.socket.on('ON_SYNC_DATA_SEND', async (data: any) => {
      const dataKey = await getRawPrivateChannel();
      const deviceCode = await getDeviceCode();
      const res = await api.syncChannelKey({
        requested_device_code: data?.[0],
        channel_key_data: dataKey,
      });
      if (res.statusCode === 200) {
        this.socket.emit('ON_SYNC_DATA_RECEIVED', {
          device_code: deviceCode,
          requested_device_code: data?.[0],
        });
      }
    });
    this.socket.on('ON_VERIFY_DEVICE_OTP_SEND', async (data: any) => {
      const deviceCode = await getDeviceCode();
      if (Object.keys(data).length > 0) {
        store.dispatch({
          type: actionTypes.TOGGLE_OTP,
          payload: !Object.keys(data).find(el => el === deviceCode)
            ? {otp: Object.values(data)?.[0], open: true}
            : {},
        });
        if (!Object.keys(data).find(el => el === deviceCode)) {
          this.socket.emit('ON_VERIFY_DEVICE_OTP_RECEIVED', {
            device_code: deviceCode,
            requested_device_code: Object.keys(data)?.[0],
          });
        }
      }
    });
    this.socket.on('ON_CHANNEL_KEY_SEND', async (data: any) => {
      const configs: any = store.getState()?.configs;
      const {privateKey} = configs;
      const current = await AsyncStorage.getItem(AsyncKey.channelPrivateKey);
      let dataLocal: any = {};
      if (typeof current === 'string') {
        dataLocal = JSON.parse(current);
      }
      Object.keys(data).forEach(k => {
        const arr = data[k];
        dataLocal[k] = [...(dataLocal?.[k] || []), ...arr];
        arr.forEach((el: any) => {
          const {timestamp} = el;
          this.emitReceivedKey(k, timestamp);
        });
      });
      await AsyncStorage.setItem(
        AsyncKey.channelPrivateKey,
        JSON.stringify(dataLocal),
      );
      const res = await getPrivateChannel(privateKey);
      store.dispatch({
        type: actionTypes.SET_CHANNEL_PRIVATE_KEY,
        payload: res,
      });
    });
    this.socket.on('ON_UPDATE_MEMBER_IN_PRIVATE_CHANNEL', async (data: any) => {
      const user: any = store.getState()?.user;
      const {channel, key, timestamp} = data;
      if (user.currentTeam.team_id === channel.team_id) {
        const isExistChannel = !!user.channel.find(
          (el: any) => el.channel_id === channel.channel_id,
        );
        if (
          isExistChannel &&
          !channel.channel_member.find(
            (el: string) => el === user.userData.user_id,
          )
        ) {
          store.dispatch({
            type: actionTypes.DELETE_CHANNEL_SUCCESS,
            payload: {channelId: channel.channel_id},
          });
        } else if (isExistChannel) {
          store.dispatch({
            type: actionTypes.UPDATE_CHANNEL_SUCCESS,
            payload: data.channel,
          });
        } else if (
          !!channel.channel_member.find(
            (el: string) => el === user.userData.user_id,
          )
        ) {
          store.dispatch({
            type: actionTypes.NEW_CHANNEL,
            payload: data.channel,
          });
        }
      }
      this.handleChannelPrivateKey(channel.channel_id, key, timestamp);
    });
    this.socket.on('ON_CREATE_NEW_CHANNEL', (data: any) => {
      const {channel, key, timestamp} = data;
      if (key && timestamp) {
        this.handleChannelPrivateKey(channel.channel_id, key, timestamp);
      }
      const user: any = store.getState()?.user;
      const {currentTeam} = user;
      if (currentTeam.team_id === channel.team_id) {
        store.dispatch({
          type: actionTypes.NEW_CHANNEL,
          payload: channel,
        });
      }
    });
    this.socket.on('ON_USER_JOIN_TEAM', (data: any) => {
      const user: any = store.getState()?.user;
      const {currentTeam} = user;
      if (currentTeam.team_id === data.team_id) {
        store.dispatch({
          type: actionTypes.NEW_USER,
          payload: data.user,
        });
      }
    });
    this.socket.on('ON_REACTION_ADDED', (data: any) => {
      const {attachment_id, emoji_id, user_id} = data.reaction_data;
      store.dispatch({
        type: actionTypes.ADD_REACT,
        payload: {
          id: attachment_id,
          reactName: emoji_id,
          userId: user_id,
        },
      });
    });
    this.socket.on('ON_REACTION_REMOVED', (data: any) => {
      const {attachment_id, emoji_id, user_id} = data.reaction_data;
      store.dispatch({
        type: actionTypes.REMOVE_REACT,
        payload: {
          id: attachment_id,
          reactName: emoji_id,
          userId: user_id,
        },
      });
    });
    this.socket.on('ON_DELETE_MESSAGE', (data: any) => {
      store.dispatch({
        type: actionTypes.DELETE_MESSAGE,
        payload: {
          messageId: data.message_id,
          channelId: data.channel_id,
          parentId: data.parent_id,
        },
      });
    });
    this.socket.on('ON_DELETE_TASK', (data: any) => {
      data.channel_ids.forEach((el: string) => {
        store.dispatch({
          type: actionTypes.DELETE_TASK_REQUEST,
          payload: {
            taskId: data.task_id,
            channelId: el,
          },
        });
      });
    });
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
    this.emitOnline(teamId);
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
}

export default new SocketUtil();
