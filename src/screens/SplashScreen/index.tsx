import ScreenID, {StackID} from 'common/ScreenID';
import React, {memo, useCallback, useEffect} from 'react';
import {View, Platform} from 'react-native';
import NavigationServices from 'services/NavigationServices';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AsyncKey} from 'common/AppStorage';
import PushNotificationHelper from 'helpers/PushNotificationHelper';
import messaging from '@react-native-firebase/messaging';
import api from 'services/api';
import {uniqChannelPrivateKey} from 'helpers/ChannelHelper';
import store from '../../store';
import useAppDispatch from 'hook/useAppDispatch';
import {
  findTeamAndChannel,
  findUser,
  getInitial,
  setCurrentChannel,
  setCurrentTeam,
} from 'actions/UserActions';
import useAppSelector from 'hook/useAppSelector';
import {setRealHeight} from 'actions/configActions';

const SplashScreen = () => {
  const dispatch = useAppDispatch();
  const privateKey = useAppSelector(state => state.configs.privateKey);
  const accessApp = useCallback(async () => {
    await dispatch(findTeamAndChannel?.());
    const {team, currentTeamId, channelMap} = store.getState()?.user;
    const channels = channelMap?.[currentTeamId];
    let params = {};
    if (
      PushNotificationHelper.initialNotification &&
      PushNotificationHelper.initNotificationData
    ) {
      const {data, type} = PushNotificationHelper.initNotificationData;
      const {team_id} = data.notification_data;
      const {entity_id, entity_type} = data.message_data;
      params = {type, entity_id, entity_type};
      const teamNotification = team?.find?.(t => t.team_id === team_id);
      const channelNotification = channels.find(
        el => el.channel_id === entity_id,
      );
      if (currentTeamId === team_id) {
        if (channelNotification) {
          await dispatch(setCurrentChannel(channelNotification));
        }
      } else if (teamNotification) {
        await dispatch(setCurrentTeam(teamNotification, entity_id));
      }
      PushNotificationHelper.reset();
    }
    NavigationServices.replace(StackID.HomeStack, params);
  }, [dispatch]);
  const initApp = useCallback(async () => {
    await uniqChannelPrivateKey();
    const accessToken = await AsyncStorage.getItem(AsyncKey.accessTokenKey);
    if (accessToken) {
      await PushNotificationHelper.init();
      const deviceToken = await messaging().getToken();
      await api.addDeviceToken({
        device_token: deviceToken,
        platform: Platform.OS === 'ios' ? 'iOS' : 'Android',
      });
      await Promise.all([dispatch(getInitial()), dispatch(findUser())]);
      if (privateKey) {
        accessApp();
      } else {
        NavigationServices.replace(ScreenID.UnlockScreen);
      }
    } else {
      NavigationServices.replace(StackID.AuthStack);
    }
  }, [dispatch, privateKey, accessApp]);
  useEffect(() => {
    initApp();
  }, [initApp]);
  const onLayout = useCallback(
    e => dispatch(setRealHeight?.(e.nativeEvent.layout.height)),
    [dispatch],
  );
  return (
    <View
      style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}
      onLayout={onLayout}
    />
  );
};

export default memo(SplashScreen);
