import React, {memo, useCallback} from 'react';
import {DrawerID} from 'common/ScreenID';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import DirectMessageDrawer from './DirectMessageDrawer';
import {useRoute} from '@react-navigation/native';

const Stack = createNativeStackNavigator();

const DirectMessageStack = () => {
  const route = useRoute();
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
        initialParams={route.params}
      />
    </Stack.Navigator>
  );
};

export default memo(DirectMessageStack);
