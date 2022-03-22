import actions from 'actions';
import {StackID} from 'common/ScreenID';
import React, {useEffect} from 'react';
import {View} from 'react-native';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import NavigationServices from 'services/NavigationServices';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AsyncKey} from 'common/AppStorage';
import PushNotificationHelper from 'helpers/PushNotificationHelper';
import {Team} from 'models';
import store from '../../store';

type SplashScreenProps = {
  findUser?: () => any;
  findTeamAndChannel?: () => any;
  getInitial?: () => any;
  setCurrentTeam?: (team: Team, channelId?: string) => any;
  setRealHeight?: (height: number) => any;
};

const SplashScreen = ({
  findUser,
  findTeamAndChannel,
  getInitial,
  setCurrentTeam,
  setRealHeight,
}: SplashScreenProps) => {
  const initApp = async () => {
    await PushNotificationHelper.init();
    const accessToken = await AsyncStorage.getItem(AsyncKey.accessTokenKey);
    if (accessToken) {
      await Promise.all([getInitial(), findUser(), findTeamAndChannel()]);
      let params = {};
      if (
        PushNotificationHelper.initialNotification &&
        PushNotificationHelper.initNotificationData
      ) {
        const {data, type} = PushNotificationHelper.initNotificationData;
        params = {type};
        const {team_id} = data.notification_data;
        const {channel_id} = data.message_data;
        const {team} = store.getState()?.user;
        const teamNotification = team?.find?.(
          (t: Team) => t.team_id === team_id,
        );
        if (teamNotification) {
          await setCurrentTeam(teamNotification, channel_id);
        }
        PushNotificationHelper.reset();
      }
      NavigationServices.replace(StackID.HomeStack, params);
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
