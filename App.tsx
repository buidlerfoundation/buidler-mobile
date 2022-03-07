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
import {Provider} from 'react-redux';
import store from './src/store';
import Spinner from 'components/Spinner';
import NavigationServices from 'services/NavigationServices';
import BottomActionSheet from 'components/BottomActionSheet';
import ImageViewer from 'components/ImageViewer';
import notifee, {EventType} from '@notifee/react-native';
import PushNotificationHelper from 'helpers/PushNotificationHelper';

LogBox.ignoreAllLogs();

const App = () => {
  useEffect(() => {
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
