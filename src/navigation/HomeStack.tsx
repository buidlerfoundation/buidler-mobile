import React from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import ScreenID from 'common/ScreenID';
import ChannelScreen from 'screens/ChannelScreen';
import ConversationScreen from 'screens/ConversationScreen';
import TaskScreen from 'screens/TaskScreen';
import {View} from 'react-native';

const Tab = createMaterialTopTabNavigator();

type HomeStackProps = {
  route: any;
};

const HomeStack = ({route}: HomeStackProps) => {
  const {type} = route.params || {};
  return (
    <Tab.Navigator
      initialRouteName={
        type === 'task' ? ScreenID.TaskScreen : ScreenID.ConversationScreen
      }
      tabBar={() => <View />}
      screenOptions={
        {
          // lazy: true,
        }
      }>
      <Tab.Screen name={ScreenID.ChannelScreen} component={ChannelScreen} />
      <Tab.Screen
        name={ScreenID.ConversationScreen}
        component={ConversationScreen}
      />
      <Tab.Screen name={ScreenID.TaskScreen} component={TaskScreen} />
    </Tab.Navigator>
  );
};

export default HomeStack;
