import React from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import ScreenID from 'common/ScreenID';
import ChannelScreen from 'screens/ChannelScreen';
import ConversationScreen from 'screens/ConversationScreen';
import {View} from 'react-native';
import {useSelector} from 'react-redux';
import NavigationServices from 'services/NavigationServices';
import ModalOtp from 'components/ModalOtp';
import PinPostScreen from 'screens/PinPostScreen';

const Tab = createMaterialTopTabNavigator();

type HomeStackProps = {
  route: any;
};

const HomeStack = ({route}: HomeStackProps) => {
  const {type} = route.params || {};
  const openOTP = useSelector((state: any) => state.configs.openOTP);
  const requestOtpCode = useSelector(
    (state: any) => state.configs.requestOtpCode,
  );
  if (openOTP && !requestOtpCode) {
    NavigationServices.pushToScreen(ScreenID.EnterOTPScreen);
  }
  return (
    <>
      <Tab.Navigator
        initialRouteName={
          type === 'task' ? ScreenID.TaskScreen : ScreenID.ConversationScreen
        }
        tabBar={() => <View />}
        screenOptions={
          {
            // lazy: true,
          }
        }>
        <Tab.Screen name={ScreenID.ChannelScreen} component={ChannelScreen} />
        <Tab.Screen
          name={ScreenID.ConversationScreen}
          component={ConversationScreen}
        />
        <Tab.Screen name={ScreenID.TaskScreen} component={PinPostScreen} />
      </Tab.Navigator>
      {openOTP && !!requestOtpCode && (
        <ModalOtp isOpen={openOTP} otp={requestOtpCode} />
      )}
    </>
  );
};

export default HomeStack;
