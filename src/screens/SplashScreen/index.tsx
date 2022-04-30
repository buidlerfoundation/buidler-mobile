import actions from 'actions';
import ScreenID, {StackID} from 'common/ScreenID';
import React, {useEffect} from 'react';
import {View, Platform} from 'react-native';
import {connect, useSelector} from 'react-redux';
import {bindActionCreators} from 'redux';
import NavigationServices from 'services/NavigationServices';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AsyncKey} from 'common/AppStorage';
import PushNotificationHelper from 'helpers/PushNotificationHelper';
import messaging from '@react-native-firebase/messaging';
import api from 'services/api';
import {Team} from 'models';
import {uniqChannelPrivateKey} from 'helpers/ChannelHelper';

type SplashScreenProps = {
  findUser?: () => any;
  getInitial?: () => any;
  setRealHeight?: (height: number) => any;
  findTeamAndChannel?: () => any;
  setCurrentTeam?: (team: Team, channelId?: string) => any;
};

const SplashScreen = ({
  findUser,
  getInitial,
  setRealHeight,
  findTeamAndChannel,
  setCurrentTeam,
}: SplashScreenProps) => {
  const privateKey = useSelector((state: any) => state.configs.privateKey);
  const team = useSelector((state: any) => state.user.team);
  const accessApp = async () => {
    await uniqChannelPrivateKey();
    await findTeamAndChannel?.();
    let params = {};
    if (
      PushNotificationHelper.initialNotification &&
      PushNotificationHelper.initNotificationData
    ) {
      const {data, type} = PushNotificationHelper.initNotificationData;
      params = {type};
      const {team_id} = data.notification_data;
      const {channel_id} = data.message_data;
      const teamNotification = team?.find?.((t: Team) => t.team_id === team_id);
      if (teamNotification) {
        await setCurrentTeam(teamNotification, channel_id);
      }
      PushNotificationHelper.reset();
    }
    NavigationServices.replace(StackID.HomeStack, params);
  };
  const initApp = async () => {
    const accessToken = await AsyncStorage.getItem(AsyncKey.accessTokenKey);
    if (accessToken) {
      await PushNotificationHelper.init();
      const deviceToken = await messaging().getToken();
      await api.addDeviceToken({
        device_token: deviceToken,
        platform: Platform.OS === 'ios' ? 'iOS' : 'Android',
      });
      await Promise.all([getInitial(), findUser()]);
      if (privateKey) {
        accessApp();
      } else {
        NavigationServices.replace(ScreenID.UnlockScreen);
      }
    } else {
      NavigationServices.replace(StackID.AuthStack);
    }
  };
  useEffect(() => {
    initApp();
  }, []);
  return (
    <View
      style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}
      onLayout={e => setRealHeight?.(e.nativeEvent.layout.height)}></View>
  );
};

const mapStateToProps = (state: any) => {
  return {};
};

const mapActionsToProps = (dispatch: any) =>
  bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapActionsToProps)(SplashScreen);
