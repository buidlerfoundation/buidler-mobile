import React, {memo} from 'react';
import {View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import ScreenID, {StackID} from 'common/ScreenID';
import SplashScreen from 'screens/SplashScreen';
import NavigationServices from 'services/NavigationServices';
import AuthStack from './AuthStack';
import UnlockScreen from 'screens/UnlockScreen';
import EnterOTP from 'screens/EnterOTP';
import useThemeColor from 'hook/useThemeColor';
import PinPostDetailScreen from 'screens/PinPostDetailScreen';
import HomeStack from './HomeStack';
import UserScreen from 'screens/UserScreen';
import AllPhotoScreen from 'screens/AllPhotoScreen';
import HeaderAllPhoto from 'components/HeaderAllPhoto';

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
          <Stack.Screen name={ScreenID.UserScreen} component={UserScreen} />
          <Stack.Screen
            name={ScreenID.PinPostDetailScreen}
            component={PinPostDetailScreen}
          />
        </Stack.Group>
        <Stack.Screen name={StackID.HomeStack} component={HomeStack} />
        <Stack.Screen name={StackID.AuthStack} component={AuthStack} />
        <Stack.Screen
          name={ScreenID.AllPhotoScreen}
          component={AllPhotoScreen}
          options={{header: () => <HeaderAllPhoto />}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default memo(RootNavigator);
