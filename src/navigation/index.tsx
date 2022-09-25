import React, {memo} from 'react';
import {View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import ScreenID, {DrawerID, StackID} from 'common/ScreenID';
import SplashScreen from 'screens/SplashScreen';
import NavigationServices from 'services/NavigationServices';
import AuthStack from './AuthStack';
import UnlockScreen from 'screens/UnlockScreen';
import EnterOTP from 'screens/EnterOTP';
import CommunityDrawer from './CommunityDrawer';
import PinPostScreen from 'screens/PinPostScreen';
import useThemeColor from 'hook/useThemeColor';

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  const theme = useThemeColor();
  return (
    <NavigationContainer
      ref={ref => (NavigationServices.navigator = ref)}
      onStateChange={NavigationServices.onNavigationStateChange}
      theme={theme}>
      <Stack.Navigator
        initialRouteName={ScreenID.SplashScreen}
        screenOptions={{
          header: () => <View />,
          animation: 'slide_from_bottom',
        }}>
        <Stack.Group
          screenOptions={{
            animation: 'none',
          }}>
          <Stack.Screen name={ScreenID.SplashScreen} component={SplashScreen} />
        </Stack.Group>
        <Stack.Group
          screenOptions={{
            animation: 'none',
          }}>
          <Stack.Screen name={ScreenID.UnlockScreen} component={UnlockScreen} />
        </Stack.Group>
        <Stack.Group
          screenOptions={{
            animation: 'default',
          }}>
          <Stack.Screen name={ScreenID.EnterOTPScreen} component={EnterOTP} />
          <Stack.Screen
            name={ScreenID.PinPostScreen}
            component={PinPostScreen}
          />
        </Stack.Group>
        <Stack.Screen
          name={DrawerID.CommunityDrawer}
          component={CommunityDrawer}
        />
        <Stack.Screen name={StackID.AuthStack} component={AuthStack} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default memo(RootNavigator);
