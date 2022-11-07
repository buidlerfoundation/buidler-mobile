import React, {memo, useCallback} from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import NotificationTabItem from './NotificationTabItem';
import NotificationTabBar from './NotificationTabBar';

const Tab = createMaterialTopTabNavigator();

const NotificationScreen = () => {
  const TabAll = useCallback(() => <NotificationTabItem type="All" />, []);
  const TabMention = useCallback(
    () => <NotificationTabItem type="Mention" />,
    [],
  );
  const TabUnread = useCallback(
    () => <NotificationTabItem type="Unread" />,
    [],
  );
  return (
    <Tab.Navigator tabBar={props => <NotificationTabBar {...props} />}>
      <Tab.Screen name="All" component={TabAll} />
      <Tab.Screen name="Mention" component={TabMention} />
      <Tab.Screen name="Unread" component={TabUnread} />
    </Tab.Navigator>
  );
};

export default memo(NotificationScreen);
