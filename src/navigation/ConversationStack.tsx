import React, {memo, useCallback} from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import ScreenID, {DrawerID} from 'common/ScreenID';
import PinPostScreen from 'screens/PinPostScreen';
import {useWindowDimensions} from 'react-native';
import ChannelDrawer from './ChannelDrawer';
import {ParamListBase, RouteProp} from '@react-navigation/native';
const Tab = createMaterialTopTabNavigator();

const ConversationStack = () => {
  const {width} = useWindowDimensions();
  const tabBar = useCallback(() => null, []);
  const screenOptions = useCallback(
    ({route}: {route: RouteProp<ParamListBase, string>; navigation: any}) => ({
      lazy: true,
      swipeEnabled: route.name !== DrawerID.ChannelDrawer,
    }),
    [],
  );
  return (
    <Tab.Navigator
      initialLayout={{width}}
      tabBar={tabBar}
      initialRouteName={DrawerID.ChannelDrawer}
      screenOptions={screenOptions}>
      <Tab.Screen name={DrawerID.ChannelDrawer} component={ChannelDrawer} />
      <Tab.Screen name={ScreenID.PinPostScreen} component={PinPostScreen} />
    </Tab.Navigator>
  );
};

export default memo(ConversationStack);
