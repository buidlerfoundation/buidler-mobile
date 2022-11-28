import React, {memo, useCallback} from 'react';
import {DrawerID} from 'common/ScreenID';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import DirectMessageDrawer from './DirectMessageDrawer';

const Stack = createNativeStackNavigator();

const DirectMessageStack = () => {
  const header = useCallback(() => null, []);
  const screenOptions = useCallback(
    () => ({
      header,
    }),
    [header],
  );
  return (
    <Stack.Navigator
      initialRouteName={DrawerID.DirectMessageDrawer}
      screenOptions={screenOptions}>
      <Stack.Screen
        name={DrawerID.DirectMessageDrawer}
        component={DirectMessageDrawer}
      />
    </Stack.Navigator>
  );
};

export default memo(DirectMessageStack);
