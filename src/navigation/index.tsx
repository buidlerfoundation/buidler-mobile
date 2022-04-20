import React from 'react';
import {View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import ScreenID, {StackID} from 'common/ScreenID';
import SplashScreen from 'screens/SplashScreen';
import NavigationServices from 'services/NavigationServices';
import HomeStack from './HomeStack';
import {connect} from 'react-redux';
import {ThemeType} from 'models';
import themes from 'themes';
import AuthStack from './AuthStack';
import UnlockScreen from 'screens/UnlockScreen';

const Stack = createNativeStackNavigator();

type RootNavigatorProps = {
  themeType: ThemeType;
};

const RootNavigator = ({themeType}: RootNavigatorProps) => {
  return (
    <NavigationContainer
      ref={ref => (NavigationServices.navigator = ref)}
      onStateChange={NavigationServices.onNavigationStateChange}
      theme={themes[themeType]}>
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
        <Stack.Screen name={StackID.HomeStack} component={HomeStack} />
        <Stack.Screen name={StackID.AuthStack} component={AuthStack} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const mapStateToProps = (state: any) => {
  return {
    themeType: state.configs.theme,
  };
};

export default connect(mapStateToProps)(RootNavigator);
