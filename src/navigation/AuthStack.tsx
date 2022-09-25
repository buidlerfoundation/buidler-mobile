import React, {memo} from 'react';
import {View} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import ScreenID from 'common/ScreenID';
import LoginScreen from 'screens/LoginScreen';
import CreatePasswordScreen from 'screens/CreatePasswordScreen';
import StoreSeedPhraseScreen from 'screens/StoreSeedPhraseScreen';
import BackupScreen from 'screens/BackupScreen';
import ImportSeedPhraseScreen from 'screens/ImportSeedPhraseScreen';

export type AuthStackParamsList = {
  LoginScreen: undefined;
  CreatePasswordScreen: {seed?: string};
  StoreSeedPhraseScreen: {password: string};
  BackupScreen: {password: string; seed: string};
  ImportSeedPhraseScreen: undefined;
};

const Stack = createNativeStackNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator
      initialRouteName={ScreenID.LoginScreen}
      screenOptions={{header: () => <View />}}>
      <Stack.Screen name={ScreenID.LoginScreen} component={LoginScreen} />
      <Stack.Screen
        name={ScreenID.CreatePasswordScreen}
        component={CreatePasswordScreen}
      />
      <Stack.Screen
        name={ScreenID.StoreSeedPhraseScreen}
        component={StoreSeedPhraseScreen}
      />
      <Stack.Screen name={ScreenID.BackupScreen} component={BackupScreen} />
      <Stack.Screen
        name={ScreenID.ImportSeedPhraseScreen}
        component={ImportSeedPhraseScreen}
      />
    </Stack.Navigator>
  );
};

export default memo(AuthStack);
