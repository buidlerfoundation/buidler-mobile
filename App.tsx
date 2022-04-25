/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useEffect} from 'react';
import {StatusBar, View, LogBox} from 'react-native';
import RootNavigator from 'navigation';
import {Provider, useSelector} from 'react-redux';
import store from './src/store';
import Spinner from 'components/Spinner';
import NavigationServices from 'services/NavigationServices';
import BottomActionSheet from 'components/BottomActionSheet';
import ImageViewer from 'components/ImageViewer';
import notifee, {EventType} from '@notifee/react-native';
import PushNotificationHelper from 'helpers/PushNotificationHelper';
import EthCrypto from 'eth-crypto';

LogBox.ignoreAllLogs();

const App = () => {
  const test = async () => {
    const encrypted = await EthCrypto.encryptWithPublicKey(
      '033333db2859fb5dc791edf29e73adc5e6addff1fa4c2e443af30b8990102ef374', // publicKey
      'foobar', // message
    );
    const message = await EthCrypto.decryptWithPrivateKey(
      '0x3e8a25bedd79c30cc8e535dde02466efc4324b9ce0a7d0a4591babcde7ef550d', // privateKey
      encrypted,
    );
    console.log('XXX: ', encrypted);
    console.log('XXX: ', message);
  };
  useEffect(() => {
    // test();
    return notifee.onForegroundEvent(({type, detail}) => {
      switch (type) {
        case EventType.DISMISSED:
          console.log('User dismissed notification', detail.notification);
          break;
        case EventType.PRESS:
          const {data, type} = detail.notification.data;
          if (!type || !data) return;
          PushNotificationHelper.notificationTapped({
            type,
            data: JSON.parse(data),
          });
          break;
      }
    });
  }, []);
  return (
    <Provider store={store}>
      <View style={{flex: 1}}>
        <StatusBar barStyle="light-content" translucent />
        <RootNavigator />
        <Spinner
          visible={false}
          ref={ref => {
            NavigationServices.loading = ref;
          }}
          size="large"
        />
        <BottomActionSheet
          ref={ref => (NavigationServices.bottomActionSheet = ref)}
        />
        <ImageViewer ref={ref => (NavigationServices.imageViewer = ref)} />
      </View>
    </Provider>
  );
};

export default App;
