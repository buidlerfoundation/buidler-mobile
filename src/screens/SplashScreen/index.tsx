import ScreenID, {StackID} from 'common/ScreenID';
import React, {memo, useCallback, useEffect, useState} from 'react';
import {View, ActivityIndicator, Alert, Linking} from 'react-native';
import NavigationServices from 'services/NavigationServices';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AsyncKey} from 'common/AppStorage';
import PushNotificationHelper from 'helpers/PushNotificationHelper';
import {uniqChannelPrivateKey} from 'helpers/ChannelHelper';

import useAppDispatch from 'hook/useAppDispatch';
import {accessToHome, findUser, getInitial} from 'actions/UserActions';
import useAppSelector from 'hook/useAppSelector';
import {setRealHeight} from 'actions/configActions';
import {actionTypes} from 'actions/actionTypes';

const SplashScreen = () => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const privateKey = useAppSelector(state => state.configs.privateKey);

  const handleLinking = useCallback(async () => {
    const deepLinkUrl = await Linking.getInitialURL();
    if (deepLinkUrl.includes('invite.buidler.app')) {
      dispatch({type: actionTypes.SET_DATA_FROM_URL, payload: deepLinkUrl});
    }
  }, [dispatch]);

  const initApp = useCallback(async () => {
    setLoading(true);
    try {
      await uniqChannelPrivateKey();
      const accessToken = await AsyncStorage.getItem(AsyncKey.accessTokenKey);
      if (accessToken) {
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
  }, [dispatch, privateKey]);
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
