import React, {memo, useCallback} from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import NotificationTabItem from './NotificationTabItem';

const Tab = createMaterialTopTabNavigator();

const NotificationScreen = () => {
  const TabAll = useCallback(() => <NotificationTabItem type="All" />, []);
  return (
    <Tab.Navigator tabBar={() => null}>
      <Tab.Screen name="All" component={TabAll} />
    </Tab.Navigator>
  );
};

export default memo(NotificationScreen);
