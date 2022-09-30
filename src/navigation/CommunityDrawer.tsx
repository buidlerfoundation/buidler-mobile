import React, {memo, useCallback, useEffect} from 'react';
import {useWindowDimensions, View} from 'react-native';
import {createDrawerNavigator} from '@react-navigation/drawer';
import ScreenID, {DrawerID, StackID} from 'common/ScreenID';
import SideBarCommunity from 'components/SideBarCommunity';
import useThemeColor from 'hook/useThemeColor';
import HomeStack from './HomeStack';
import {useNavigation, useRoute} from '@react-navigation/native';
const Drawer = createDrawerNavigator();

const CommunityDrawer = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {colors} = useThemeColor();
  const {width} = useWindowDimensions();
  const drawerContent = useCallback(
    props => <SideBarCommunity {...props} />,
    [],
  );
  useEffect(() => {
    const {entity_id, entity_type} = route.params || {};
    if (entity_id && entity_type === 'post') {
      navigation.navigate(ScreenID.PinPostDetailScreen, {postId: entity_id});
    }
  }, [navigation, route.params]);
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
      <Drawer.Screen
        name={StackID.HomeStack}
        component={HomeStack}
        initialParams={route.params}
      />
    </Drawer.Navigator>
  );
};

export default memo(CommunityDrawer);
