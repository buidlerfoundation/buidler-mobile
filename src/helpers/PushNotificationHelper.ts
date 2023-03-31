import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import Permissions from 'react-native-permissions';
import notifee from '@notifee/react-native';
import store from '../store';
import NavigationServices from 'services/NavigationServices';
import ScreenID, {StackID} from 'common/ScreenID';
import {
  setCurrentChannel,
  setCurrentDirectChannel,
  setCurrentTeam,
  syncDirectChannelData,
} from 'actions/UserActions';

type NotificationPayload = {data: any; type: string};

class PushNotificationHelper {
  initialNotification = false;
  initNotificationData: NotificationPayload = null;
  async init() {
    this.initialNotification = false;
    this.initNotificationData = null;
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
    NavigationServices.closeImageViewer();
    const {
      currentTeamId,
      currentChannelId,
      currentDirectChannelId,
      team,
      channelMap,
      directChannel,
    } = store.getState()?.user;
    const channel = channelMap?.[currentTeamId];
    const {team_id, channel_type} = data.notification_data;
    const {entity_id, entity_type, message_id} = data.message_data;
    const direct = channel_type === 'Direct';
    const channelId = direct ? currentDirectChannelId : currentChannelId;
    const teamNotification = team.find(t => t.team_id === team_id);
    const channelNotification = channel.find(c => c.channel_id === entity_id);
    if (direct) {
      if (!directChannel.find(el => el.channel_id === entity_id)) {
        const success = await store.dispatch(syncDirectChannelData());
        if (!success) {
          return;
        }
      }
      store.dispatch(setCurrentDirectChannel({channel_id: entity_id}));
    } else {
      if (channelId === entity_id) {
        // Do nothing
      } else if (currentTeamId === team_id) {
        if (channelNotification) {
          store.dispatch(setCurrentChannel(channelNotification));
        }
      } else if (teamNotification && !direct) {
        store.dispatch(
          setCurrentTeam(
            teamNotification,
            entity_type === 'channel' ? entity_id : undefined,
          ),
        );
      }
    }
    if (entity_type === 'post') {
      NavigationServices.pushToScreen(ScreenID.PinPostDetailScreen, {
        postId: entity_id,
        messageId: message_id,
      });
    } else {
      if (direct) {
        NavigationServices.pushToScreen(StackID.DirectMessageStack, {
          fromNotification: true,
          jumpMessageId: message_id,
          channelId: entity_id,
        });
      } else {
        NavigationServices.pushToScreen(ScreenID.ConversationScreen, {
          fromNotification: true,
          jumpMessageId: message_id,
          channelId: entity_id,
        });
      }
    }
  };

  showInAppNotification = async (
    notificationOpen: FirebaseMessagingTypes.RemoteMessage,
  ) => {
    const {currentChannelId, currentDirectChannelId} = store.getState()?.user;
    const {notification_data} = JSON.parse(notificationOpen.data.data);
    const currentRouteName = NavigationServices.currentRouter?.name;
    const channelId =
      currentRouteName === ScreenID.DirectMessageScreen
        ? currentDirectChannelId
        : currentChannelId;
    if (notification_data?.entity_id !== channelId) {
      await notifee.displayNotification({
        data: notificationOpen.data,
        body: notification_data.body.replace(/(<@)(.*?)(-)(.*?)(>)/gim, '@$2'),
        title: notification_data.title.replace(
          /(<@)(.*?)(-)(.*?)(>)/gim,
          '@$2',
        ),
        subtitle: notification_data.subtitle?.replace?.(
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

  deleteToken() {
    return messaging().deleteToken();
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
