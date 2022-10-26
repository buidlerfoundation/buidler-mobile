import React, {memo} from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import WalletTokens from './WalletTokens';
import WalletCollectibles from './WalletCollectibles';
import useThemeColor from 'hook/useThemeColor';
import AppStyles from 'common/AppStyles';

const Tab = createMaterialTopTabNavigator();

const WalletScreen = () => {
  const {colors} = useThemeColor();
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarItemStyle: {width: 'auto', padding: 10},
        tabBarStyle: {
          backgroundColor: colors.background,
          paddingHorizontal: 10,
          marginTop: 40,
        },
        tabBarLabelStyle: [AppStyles.TextSemi16, {textTransform: 'none'}],
        tabBarInactiveTintColor: colors.subtext,
        tabBarActiveTintColor: colors.text,
        tabBarIndicator: () => null,
      }}>
      <Tab.Screen name="Tokens" component={WalletTokens} />
      <Tab.Screen name="NFT collections" component={WalletCollectibles} />
    </Tab.Navigator>
  );
};

export default memo(WalletScreen);
