import ScreenID, {StackID} from 'common/ScreenID';
import React, {memo, useCallback, useEffect, useState} from 'react';
import {View, ActivityIndicator, Alert, Linking} from 'react-native';
import NavigationServices from 'services/NavigationServices';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AsyncKey, GeneratedPrivateKey} from 'common/AppStorage';
import PushNotificationHelper from 'helpers/PushNotificationHelper';
import {uniqChannelPrivateKey} from 'helpers/ChannelHelper';

import useAppDispatch from 'hook/useAppDispatch';
import {accessToHome, findUser, getInitial} from 'actions/UserActions';
import {setRealHeight} from 'actions/configActions';
import {actionTypes} from 'actions/actionTypes';
import store from 'store';
import {LoginType} from 'common/AppConfig';

const SplashScreen = () => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const handleLinking = useCallback(async () => {
    const deepLinkUrl = await Linking.getInitialURL();
    if (deepLinkUrl?.includes('invite.buidler.app')) {
      dispatch({type: actionTypes.SET_DATA_FROM_URL, payload: deepLinkUrl});
    }
  }, [dispatch]);

  const initApp = useCallback(async () => {
    setLoading(true);
    try {
      await uniqChannelPrivateKey();
      const accessToken = await AsyncStorage.getItem(AsyncKey.accessTokenKey);
      const loginType = await AsyncStorage.getItem(AsyncKey.loginType);
      let privateKey = store.getState().configs?.privateKey;
      if (loginType === LoginType.WalletConnect) {
        privateKey = await GeneratedPrivateKey();
        dispatch({type: actionTypes.SET_PRIVATE_KEY, payload: privateKey});
      }
      if (accessToken) {
        dispatch({type: actionTypes.UPDATE_LOGIN_TYPE, payload: loginType});
        await PushNotificationHelper.init();
        await Promise.all([dispatch(getInitial()), dispatch(findUser())]);
        if (privateKey) {
          await dispatch(accessToHome());
        } else {
          NavigationServices.replace(ScreenID.UnlockScreen);
        }
      } else {
        NavigationServices.replace(StackID.AuthStack);
      }
    } catch (error) {
      console.log(JSON.stringify(error), error);
      if (error !== 'Refresh token failed') {
        Alert.alert(
          'Alert',
          'Something went wrong, check your network then try again!',
          [{text: 'Retry', onPress: initApp}],
        );
      }
    }
    setLoading(false);
  }, [dispatch]);
  useEffect(() => {
    handleLinking();
  }, [handleLinking]);
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
      onLayout={onLayout}>
      {loading && <ActivityIndicator />}
    </View>
  );
};

export default memo(SplashScreen);
