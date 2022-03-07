import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import Permissions from 'react-native-permissions';
import notifee from '@notifee/react-native';
import {actionTypes} from 'actions/actionTypes';
import api from 'services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AsyncKey} from 'common/AppStorage';
import SocketUtils from 'utils/SocketUtils';
import store from '../store';
import {Team} from 'models';
import NavigationServices from 'services/NavigationServices';
import ScreenID from 'common/ScreenID';

type NotificationPayload = {data: any; type: string};

class PushNotificationHelper {
  initialNotification = false;
  initNotificationData: NotificationPayload = null;
  async init() {
    const enabled = await this.checkPermission();
    if (enabled) {
      await messaging().registerDeviceForRemoteMessages();
      messaging()
        .getInitialNotification()
        .then(notificationOpen => {
          if (notificationOpen) {
            const {type, data} = notificationOpen.data || {};
            if (!type || !data) return;
            this.initialNotification = true;
            this.initNotificationData = {type, data: JSON.parse(data)};
          }
        });

      messaging().onMessage(async notificationOpen => {
        this.showInAppNotification(notificationOpen);
      });
      messaging().onNotificationOpenedApp(notificationOpen => {
        const {type, data} = notificationOpen.data || {};
        if (!type || !data) return;
        this.notificationTapped({type, data: JSON.parse(data)});
      });
    } else {
      try {
        const accept = await this.requestPermissionNotification();
        if (accept) {
          await this.init();
        }
      } catch (error) {
        // User has rejected permissions
      }
    }
  }

  notificationTapped = async ({data, type}: NotificationPayload) => {
    if (type === 'message') {
      const {currentTeam, teamUserData, team, channel, userData} =
        store.getState()?.user;
      const {team_id} = data.notification_data;
      const {channel_id} = data.message_data;

      const teamNotification = team.find((t: any) => t.team_id === team_id);
      const channelNotification = channel.find(
        (c: any) => c.channel_id === channel_id,
      );
      if (channelNotification?.channel_type === 'Direct') {
        channelNotification.user = teamUserData.find(
          (u: any) =>
            u.user_id ===
            channelNotification.channel_member.find(
              (el: string) => el !== userData?.user_id,
            ),
        );
      }
      if (currentTeam.team_id === team_id) {
        store.dispatch({
          type: actionTypes.SET_CURRENT_CHANNEL,
          payload: {channel: channelNotification},
        });
      } else {
        await this.setTeamFromNotification(
          teamNotification,
          channel_id,
          store.dispatch,
        );
      }

      if (NavigationServices.currentRouteName === ScreenID.ConversationScreen)
        return;
      NavigationServices.pushToScreen(ScreenID.ConversationScreen);
    }
  };

  showInAppNotification = async (
    notificationOpen: FirebaseMessagingTypes.RemoteMessage,
  ) => {
    const {title, body} = notificationOpen.notification;
    await notifee.displayNotification({
      title,
      body,
      data: notificationOpen.data,
    });
  };

  async getToken() {
    const token = await messaging().getToken();
    return token;
  }

  async checkPermission() {
    const res = await Permissions.checkNotifications();
    return res.status == Permissions.RESULTS.GRANTED;
  }

  requestPermissionNotification = async () => {
    const res = await Permissions.requestNotifications(['alert', 'sound']);
    return res.status == Permissions.RESULTS.GRANTED;
  };

  reset = () => {
    this.initialNotification = false;
    this.initNotificationData = null;
  };

  setTeamFromNotification = async (
    team: Team,
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
    SocketUtils.changeTeam(team.team_id);
    dispatch({
      type: actionTypes.SET_CURRENT_TEAM,
      payload: {team, resChannel, lastChannelId},
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
}

export default new PushNotificationHelper();
