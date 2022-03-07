import React from 'react';
import {View} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import ScreenID from 'common/ScreenID';
import LoginScreen from 'screens/LoginScreen';

const Stack = createNativeStackNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator
      initialRouteName={ScreenID.LoginScreen}
      screenOptions={{header: () => <View />}}>
      <Stack.Screen name={ScreenID.LoginScreen} component={LoginScreen} />
    </Stack.Navigator>
  );
};

export default AuthStack;
