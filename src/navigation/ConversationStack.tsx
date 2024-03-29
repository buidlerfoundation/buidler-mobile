import React, {memo, useCallback} from 'react';
import ScreenID, {DrawerID} from 'common/ScreenID';
import PinPostScreen from 'screens/PinPostScreen';
import ChannelDrawer from './ChannelDrawer';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

const ConversationStack = () => {
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
      <Stack.Screen name={DrawerID.ChannelDrawer} component={ChannelDrawer} />
      <Stack.Screen name={ScreenID.PinPostScreen} component={PinPostScreen} />
    </Stack.Navigator>
  );
};

export default memo(ConversationStack);
