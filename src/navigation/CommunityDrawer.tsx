import React, {memo, useCallback} from 'react';
import {useWindowDimensions, View} from 'react-native';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {DrawerID, StackID} from 'common/ScreenID';
import SideBarCommunity from 'components/SideBarCommunity';
import useThemeColor from 'hook/useThemeColor';
import HomeStack from './HomeStack';
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
      id={DrawerID.CommunityDrawer}
      drawerContent={drawerContent}
      screenOptions={{
        header: () => <View />,
        drawerType: 'back',
        drawerStyle: {
          backgroundColor: colors.backgroundHeader,
          width: width - 80,
        },
      }}>
      <Drawer.Screen name={StackID.HomeStack} component={HomeStack} />
    </Drawer.Navigator>
  );
};

export default memo(CommunityDrawer);
