import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import Permissions from 'react-native-permissions';
import notifee from '@notifee/react-native';
import {actionTypes} from 'actions/actionTypes';
import store from '../store';
import NavigationServices from 'services/NavigationServices';
import ScreenID from 'common/ScreenID';
import {setCurrentTeam} from 'actions/UserActions';
import {getMessages} from 'actions/MessageActions';

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
      const {currentTeamId, currentChannelId, team, channelMap} =
        store.getState()?.user;
      const channel = channelMap?.[currentTeamId];
      const {team_id} = data.notification_data;
      const {entity_id, entity_type} = data.message_data;

      const teamNotification = team.find(t => t.team_id === team_id);
      const channelNotification = channel.find(c => c.channel_id === entity_id);
      if (entity_type === 'channel') {
        await store.dispatch(
          getMessages(entity_id, 'Public', undefined, undefined, true),
        );
      }
      if (currentChannelId === entity_id) {
        // Do nothing
      } else if (currentTeamId === team_id) {
        if (channelNotification) {
          store.dispatch({
            type: actionTypes.SET_CURRENT_CHANNEL,
            payload: {channel: channelNotification},
          });
        }
      } else if (teamNotification) {
        await store.dispatch(setCurrentTeam(teamNotification, entity_id));
      }
      if (entity_type === 'post') {
        NavigationServices.pushToScreen(ScreenID.PinPostDetailScreen, {
          postId: entity_id,
        });
      } else {
        NavigationServices.pushToScreen(ScreenID.ConversationScreen, {
          fromNotification: true,
        });
      }
    }
  };

  showInAppNotification = async (
    notificationOpen: FirebaseMessagingTypes.RemoteMessage,
  ) => {
    const {currentChannelId} = store.getState()?.user;
    const {notification_data} = JSON.parse(notificationOpen.data.data);
    if (notification_data?.entity_id !== currentChannelId) {
      await notifee.displayNotification({
        data: notificationOpen.data,
        body: notification_data.body.replace(/(<@)(.*?)(-)(.*?)(>)/gim, '@$2'),
        title: notification_data.title.replace(
          /(<@)(.*?)(-)(.*?)(>)/gim,
          '@$2',
        ),
        subtitle: notification_data.subtitle.replace(
          /(<@)(.*?)(-)(.*?)(>)/gim,
          '@$2',
        ),
      });
    }
  };

  async getToken() {
    const token = await messaging().getToken();
    return token;
  }

  async checkPermission() {
    const res = await Permissions.checkNotifications();
    return res.status === Permissions.RESULTS.GRANTED;
  }

  requestPermissionNotification = async () => {
    const res = await Permissions.requestNotifications(['alert', 'sound']);
    return res.status === Permissions.RESULTS.GRANTED;
  };

  reset = () => {
    this.initialNotification = false;
    this.initNotificationData = null;
  };
}

export default new PushNotificationHelper();
