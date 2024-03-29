import React, {useEffect, useRef} from 'react';
import {StatusBar, View, LogBox, AppState, Text, TextInput} from 'react-native';
import RootNavigator from 'navigation';
import {Provider} from 'react-redux';
import store from './src/store';
import Spinner from 'components/Spinner';
import NavigationServices from 'services/NavigationServices';
import BottomActionSheet from 'components/BottomActionSheet';
import ImageViewer from 'components/ImageViewer';
import notifee, {EventType} from '@notifee/react-native';
import PushNotificationHelper from 'helpers/PushNotificationHelper';
import ModalContainer from 'components/ModalContainer';
import ToastContainer from 'components/ToastContainer';
import SocketUtils from 'utils/SocketUtils';

LogBox.ignoreAllLogs();

const App = () => {
  const appState = useRef(AppState.currentState);
  useEffect(() => {
    if (Text.defaultProps == null) Text.defaultProps = {};
    Text.defaultProps.allowFontScaling = false;
    if (TextInput.defaultProps == null) TextInput.defaultProps = {};
    TextInput.defaultProps.allowFontScaling = false;
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        SocketUtils.reconnectIfNeeded();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);
  useEffect(() => {
    return notifee.onForegroundEvent(({type, detail}) => {
      switch (type) {
        case EventType.DISMISSED:
          console.log('User dismissed notification', detail.notification);
          break;
        case EventType.PRESS:
          const {data, type} = detail.notification.data;
          if (!type || !data) {
            return;
          }
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
        <ModalContainer>
          <RootNavigator />
        </ModalContainer>
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
        <ToastContainer />
      </View>
    </Provider>
  );
};

export default App;
