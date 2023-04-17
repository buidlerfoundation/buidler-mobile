import React, {memo, useEffect} from 'react';
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
import CommunityDetailScreen from 'screens/CommunityDetailScreen';
import useUserData from 'hook/useUserData';
import MixpanelAnalytics from 'services/analytics/MixpanelAnalytics';
import StoreSeedPhraseScreen from 'screens/StoreSeedPhraseScreen';
import BackupScreen from 'screens/BackupScreen';
import BackupDataScreen from 'screens/BackupDataScreen';
import NFTDetailScreen from 'screens/NFTDetailScreen';
import DAppBrowserScreen from 'screens/DAppBrowserScreen';
import CreatePasswordScreen from 'screens/CreatePasswordScreen';
import ImportSeedPhraseScreen from 'screens/ImportSeedPhraseScreen';
import LoadingScreen from 'screens/LoadingScreen';

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  const theme = useThemeColor();
  const userData = useUserData();
  useEffect(() => {
    if (userData.user_id) {
      MixpanelAnalytics.identify(userData);
    }
  }, [userData]);
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
          <Stack.Screen name={ScreenID.UnlockScreen} component={UnlockScreen} />
          <Stack.Screen name={StackID.HomeStack} component={HomeStack} />
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
          <Stack.Screen
            name={ScreenID.CommunityDetailScreen}
            component={CommunityDetailScreen}
          />
          <Stack.Screen
            name={ScreenID.StoreSeedPhraseScreen}
            component={StoreSeedPhraseScreen}
          />
          <Stack.Screen name={ScreenID.BackupScreen} component={BackupScreen} />
          <Stack.Screen
            name={ScreenID.BackupDataScreen}
            component={BackupDataScreen}
          />
          <Stack.Screen
            name={ScreenID.NFTDetailScreen}
            component={NFTDetailScreen}
            options={{presentation: 'modal'}}
          />
          <Stack.Screen
            name={ScreenID.DAPPBrowserScreen}
            component={DAppBrowserScreen}
          />
          <Stack.Screen
            name={ScreenID.CreatePasswordScreen}
            component={CreatePasswordScreen}
          />
          <Stack.Screen
            name={ScreenID.ImportSeedPhraseScreen}
            component={ImportSeedPhraseScreen}
          />
        </Stack.Group>
        <Stack.Screen name={StackID.AuthStack} component={AuthStack} />
        <Stack.Screen name={ScreenID.LoadingScreen} component={LoadingScreen} />
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
