import React, {memo} from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import ScreenID, {DrawerID} from 'common/ScreenID';
import {View} from 'react-native';
import {useSelector} from 'react-redux';
import NavigationServices from 'services/NavigationServices';
import ModalOtp from 'components/ModalOtp';
import ChannelDrawer from './ChannelDrawer';

const Tab = createMaterialTopTabNavigator();

const HomeStack = () => {
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
        initialRouteName={DrawerID.ChannelDrawer}
        tabBarPosition="bottom"
        tabBar={() => <View />}>
        <Tab.Screen name={DrawerID.ChannelDrawer} component={ChannelDrawer} />
      </Tab.Navigator>
      {openOTP && !!requestOtpCode && (
        <ModalOtp isOpen={openOTP} otp={requestOtpCode} />
      )}
    </>
  );
};

export default memo(HomeStack);
