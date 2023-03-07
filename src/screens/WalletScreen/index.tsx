import React, {memo} from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import WalletCollectibles from './WalletCollectibles';
import useThemeColor from 'hook/useThemeColor';
import AppStyles from 'common/AppStyles';
import useWalletBalance from 'hook/useWalletBalance';
import FastImage from 'react-native-fast-image';

const Tab = createMaterialTopTabNavigator();

const WalletScreen = () => {
  const {colors} = useThemeColor();
  const walletBalance = useWalletBalance();
  if (!walletBalance?.coins || walletBalance?.coins?.length === 0) return null;
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarScrollEnabled: true,
        tabBarItemStyle: {
          width: 'auto',
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 0,
          marginHorizontal: 5,
        },
        tabBarStyle: {
          backgroundColor: colors.background,
          marginTop: 40,
          shadowOffset: {width: 0, height: 0},
          elevation: 0,
          marginHorizontal: 10,
        },
        tabBarLabelStyle: [
          AppStyles.TextSemi15,
          {textTransform: 'none', marginTop: 0, marginLeft: 0},
        ],
        tabBarInactiveTintColor: colors.subtext,
        tabBarActiveTintColor: colors.text,
        tabBarIndicator: () => null,
      }}>
      {walletBalance?.coins?.map(el => (
        <Tab.Screen
          key={el.contract.network}
          name={el.contract.name}
          component={WalletCollectibles}
          initialParams={{token: el}}
          options={{
            tabBarIcon: () => (
              <FastImage
                style={{width: 20, height: 20}}
                source={{uri: el.contract.logo}}
              />
            ),
          }}
        />
      ))}
    </Tab.Navigator>
  );
};

export default memo(WalletScreen);
