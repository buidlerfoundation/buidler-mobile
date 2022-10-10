import React, {memo, useCallback, useMemo} from 'react';
import {useWindowDimensions, View} from 'react-native';
import {createDrawerNavigator} from '@react-navigation/drawer';
import ScreenID, {DrawerID} from 'common/ScreenID';
import ChannelScreen from 'screens/ChannelScreen';
import useThemeColor from 'hook/useThemeColor';
import ConversationScreen from 'screens/ConversationScreen';
import {useRoute} from '@react-navigation/native';
const Drawer = createDrawerNavigator();

const ChannelDrawer = () => {
  const route = useRoute();
  const {colors} = useThemeColor();
  const {width} = useWindowDimensions();
  const drawerContent = useCallback(props => <ChannelScreen {...props} />, []);
  const header = useCallback(() => <View />, []);
  const screenOptions = useMemo(
    () => ({
      header,
      drawerType: 'back',
      drawerStyle: {
        backgroundColor: colors.backgroundHeader,
        width: width - 80,
      },
      swipeEdgeWidth: width,
      swipeMinDistance: 0.1,
      overlayColor: '#19191980',
    }),
    [colors.backgroundHeader, header, width],
  );
  return (
    <Drawer.Navigator
      id={DrawerID.ChannelDrawer}
      initialRouteName={ScreenID.ConversationScreen}
      drawerContent={drawerContent}
      screenOptions={screenOptions}>
      <Drawer.Screen
        name={ScreenID.ConversationScreen}
        component={ConversationScreen}
        initialParams={route.params}
      />
    </Drawer.Navigator>
  );
};

export default memo(ChannelDrawer);
