import React, {memo, useCallback} from 'react';
import ScreenID from 'common/ScreenID';
import PinPostScreen from 'screens/PinPostScreen';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import SpaceDetailScreen from 'screens/SpaceDetailScreen';
import {useRoute} from '@react-navigation/native';
import ConversationScreen from 'screens/ConversationScreen';

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
      initialRouteName={ScreenID.ConversationScreen}
      screenOptions={screenOptions}>
      <Stack.Screen
        name={ScreenID.ConversationScreen}
        component={ConversationScreen}
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
