import React, {memo, useCallback} from 'react';
import {useWindowDimensions, View} from 'react-native';
import {createDrawerNavigator} from '@react-navigation/drawer';
import ScreenID from 'common/ScreenID';
import SideBarCommunity from 'components/SideBarCommunity';
import ChannelScreen from 'screens/ChannelScreen';
import useThemeColor from 'hook/useThemeColor';
const Drawer = createDrawerNavigator();

const CommunityDrawer = () => {
  const {colors} = useThemeColor();
  const {width} = useWindowDimensions();
  const drawerContent = useCallback(
    props => <SideBarCommunity {...props} />,
    [],
  );
  return (
    <Drawer.Navigator
      drawerContent={drawerContent}
      screenOptions={{
        header: () => <View />,
        drawerType: 'back',
        drawerStyle: {
          backgroundColor: colors.backgroundHeader,
          width: width - 80,
        },
        swipeEdgeWidth: width,
      }}>
      <Drawer.Screen name={ScreenID.ChannelScreen} component={ChannelScreen} />
    </Drawer.Navigator>
  );
};

export default memo(CommunityDrawer);
