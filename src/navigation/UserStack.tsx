import React, {memo, useCallback} from 'react';
import ScreenID from 'common/ScreenID';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import WalletHeader from 'screens/WalletScreen/WalletHeader';
import ProfileScreen from 'screens/ProfileScreen';
import WalletScreen from 'screens/WalletScreen';

const Stack = createNativeStackNavigator();

const UserStack = () => {
  const header = useCallback(() => null, []);
  return (
    <Stack.Navigator initialRouteName={ScreenID.WalletScreen}>
      <Stack.Screen
        options={{header: () => <WalletHeader />}}
        name={ScreenID.WalletScreen}
        component={WalletScreen}
      />
      <Stack.Screen
        options={{header}}
        name={ScreenID.ProfileScreen}
        component={ProfileScreen}
      />
    </Stack.Navigator>
  );
};

export default memo(UserStack);
