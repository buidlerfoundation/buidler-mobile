import React, {memo, useCallback} from 'react';
import ScreenID, {DrawerID} from 'common/ScreenID';
import PinPostScreen from 'screens/PinPostScreen';
import ChannelDrawer from './ChannelDrawer';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import SpaceDetailScreen from 'screens/SpaceDetailScreen';
import {useRoute} from '@react-navigation/native';

const Stack = createNativeStackNavigator();

const ConversationStack = () => {
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
      initialRouteName={DrawerID.ChannelDrawer}
      screenOptions={screenOptions}>
      <Stack.Screen
        name={DrawerID.ChannelDrawer}
        component={ChannelDrawer}
        initialParams={route.params}
      />
      <Stack.Screen name={ScreenID.PinPostScreen} component={PinPostScreen} />
      <Stack.Screen
        name={ScreenID.SpaceDetailScreen}
        component={SpaceDetailScreen}
      />
    </Stack.Navigator>
  );
};

export default memo(ConversationStack);
