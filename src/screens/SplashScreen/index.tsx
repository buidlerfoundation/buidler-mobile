import actions from 'actions';
import ScreenID, {StackID} from 'common/ScreenID';
import React, {useEffect} from 'react';
import {View, Platform} from 'react-native';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import NavigationServices from 'services/NavigationServices';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AsyncKey} from 'common/AppStorage';
import PushNotificationHelper from 'helpers/PushNotificationHelper';
import messaging from '@react-native-firebase/messaging';
import api from 'services/api';

type SplashScreenProps = {
  findUser?: () => any;
  getInitial?: () => any;
  setRealHeight?: (height: number) => any;
};

const SplashScreen = ({
  findUser,
  getInitial,
  setRealHeight,
}: SplashScreenProps) => {
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
      NavigationServices.replace(ScreenID.UnlockScreen);
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
