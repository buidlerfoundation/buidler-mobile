import React, {memo, useCallback, useMemo} from 'react';
import {useWindowDimensions, View} from 'react-native';
import {createDrawerNavigator} from '@react-navigation/drawer';
import ScreenID, {DrawerID} from 'common/ScreenID';
import useThemeColor from 'hook/useThemeColor';
import {useRoute} from '@react-navigation/native';
import DirectChannelScreen from 'screens/DirectChannelScreen';
import DirectMessageScreen from 'screens/DirectMessageScreen';
const Drawer = createDrawerNavigator();

const DirectMessageDrawer = () => {
  const route = useRoute();
  const {colors} = useThemeColor();
  const {width} = useWindowDimensions();
  const drawerContent = useCallback(
    props => <DirectChannelScreen {...props} />,
    [],
  );
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
      id={DrawerID.DirectMessageDrawer}
      initialRouteName={ScreenID.DirectMessageScreen}
      drawerContent={drawerContent}
      screenOptions={screenOptions}>
      <Drawer.Screen
        name={ScreenID.DirectMessageScreen}
        component={DirectMessageScreen}
        initialParams={route.params}
      />
    </Drawer.Navigator>
  );
};

export default memo(DirectMessageDrawer);
