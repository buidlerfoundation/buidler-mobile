import React, {memo, useCallback, useEffect} from 'react';
import {View} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import ScreenID, {StackID} from 'common/ScreenID';
import {useSelector} from 'react-redux';
import NavigationServices from 'services/NavigationServices';
import ModalOtp from 'components/ModalOtp';
import WalletScreen from 'screens/WalletScreen';
import ProfileScreen from 'screens/ProfileScreen';
import useThemeColor from 'hook/useThemeColor';
import SVG from 'common/SVG';
import useAppSelector from 'hook/useAppSelector';
import AvatarView from 'components/AvatarView';
import {useRoute} from '@react-navigation/native';
import ConversationStack from './ConversationStack';
import SideBarCommunity from 'components/SideBarCommunity';

const Tab = createBottomTabNavigator();

const HomeStack = () => {
  const route = useRoute();
  const userData = useAppSelector(state => state.user.userData);
  const {colors} = useThemeColor();
  const openOTP = useSelector((state: any) => state.configs.openOTP);
  const requestOtpCode = useSelector(
    (state: any) => state.configs.requestOtpCode,
  );
  useEffect(() => {
    if (openOTP && !requestOtpCode) {
      NavigationServices.pushToScreen(ScreenID.EnterOTPScreen);
    }
  }, [openOTP, requestOtpCode]);
  const header = useCallback(() => null, []);
  const tabBarIconHome = useCallback(
    ({color}: {focused: boolean; color: string}) => {
      return <SVG.IconTabHome fill={color} />;
    },
    [],
  );
  const tabBarIconChat = useCallback(
    ({color}: {focused: boolean; color: string}) => {
      return <SVG.IconTabChat fill={color} />;
    },
    [],
  );
  const tabBarIconWallet = useCallback(
    ({color}: {focused: boolean; color: string}) => {
      return <SVG.IconTabWallet fill={color} />;
    },
    [],
  );
  const tabBarIconProfile = useCallback(
    ({focused}: {focused: boolean; color: string}) => {
      return (
        <View>
          <AvatarView user={userData} withStatus={false} size={28} />
          {!focused && (
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                position: 'absolute',
                backgroundColor: '#00000080',
              }}
            />
          )}
        </View>
      );
    },
    [userData],
  );
  return (
    <>
      <Tab.Navigator
        initialRouteName={StackID.ConversationStack}
        screenOptions={{
          header,
          tabBarInactiveTintColor: colors.subtext,
          tabBarActiveTintColor: colors.text,
          tabBarStyle: {backgroundColor: colors.background},
          tabBarShowLabel: false,
        }}>
        <Tab.Screen
          options={{tabBarIcon: tabBarIconHome}}
          name={ScreenID.CommunityScreen}
          component={SideBarCommunity}
        />
        <Tab.Screen
          options={{tabBarIcon: tabBarIconChat}}
          name={StackID.ConversationStack}
          component={ConversationStack}
          initialParams={route.params}
        />
        <Tab.Screen
          options={{tabBarIcon: tabBarIconWallet}}
          name={ScreenID.WalletScreen}
          component={WalletScreen}
        />
        <Tab.Screen
          options={{tabBarIcon: tabBarIconProfile}}
          name={ScreenID.ProfileScreen}
          component={ProfileScreen}
        />
      </Tab.Navigator>
      {openOTP && !!requestOtpCode && (
        <ModalOtp isOpen={openOTP} otp={requestOtpCode} />
      )}
    </>
  );
};

export default memo(HomeStack);
