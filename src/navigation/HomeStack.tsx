import React, {memo, useCallback, useEffect} from 'react';
import {View, Linking} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import ScreenID, {StackID} from 'common/ScreenID';
import NavigationServices, {getCurrentRoute} from 'services/NavigationServices';
import ModalOtp from 'components/ModalOtp';
import WalletScreen from 'screens/WalletScreen';
import ProfileScreen from 'screens/ProfileScreen';
import useThemeColor from 'hook/useThemeColor';
import SVG from 'common/SVG';
import useAppSelector from 'hook/useAppSelector';
import AvatarView from 'components/AvatarView';
import {useNavigation, useRoute} from '@react-navigation/native';
import ConversationStack from './ConversationStack';
import SideBarCommunity from 'components/SideBarCommunity';
import useAppDispatch from 'hook/useAppDispatch';
import {acceptInvitation} from 'actions/UserActions';
import WalletHeader from 'screens/WalletScreen/WalletHeader';
import NotificationScreen from 'screens/NotificationScreen';

const Tab = createBottomTabNavigator();

const HomeStack = () => {
  const dispatch = useAppDispatch();
  const route = useRoute();
  const navigation = useNavigation();
  const userData = useAppSelector(state => state.user.userData);
  const {colors} = useThemeColor();
  const openOTP = useAppSelector(state => state.configs.openOTP);
  const requestOtpCode = useAppSelector(state => state.configs.requestOtpCode);
  const handleOpenURL = useCallback(
    async (e: {url: string}) => {
      const {url} = e;
      if (url.includes('invite.buidler.app')) {
        dispatch(acceptInvitation(url));
      }
    },
    [dispatch],
  );
  useEffect(() => {
    Linking.removeAllListeners('url');
    Linking.addEventListener('url', handleOpenURL);
  }, [handleOpenURL]);
  useEffect(() => {
    if (route.params?.entity_type === 'post' && route.params?.entity_id) {
      navigation.navigate(ScreenID.PinPostDetailScreen, {
        postId: route.params?.entity_id,
      });
    }
  }, [navigation, route.params?.entity_id, route.params?.entity_type]);
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
  const tabBarIconNotification = useCallback(
    ({color}: {focused: boolean; color: string}) => {
      return (
        <View>
          <SVG.IconTabNotification fill={color} />
          {userData.total_unread_notifications > 0 && (
            <View
              style={{
                position: 'absolute',
                width: 11,
                height: 11,
                borderRadius: 5.5,
                backgroundColor: colors.mention,
                top: 3.5,
                right: 3.5,
                borderColor: colors.background,
                borderWidth: 1.5,
              }}
            />
          )}
        </View>
      );
    },
    [colors.background, colors.mention, userData.total_unread_notifications],
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
  const screenOptions = useCallback(
    () => ({
      header,
      tabBarInactiveTintColor: colors.subtext,
      tabBarActiveTintColor: colors.text,
      tabBarStyle: {
        backgroundColor: colors.background,
        borderTopColor: colors.border,
      },
      tabBarShowLabel: false,
    }),
    [colors.background, colors.border, colors.subtext, colors.text, header],
  );
  const conversationOptions = useCallback(
    ({navigation}) => {
      const currentRoute = getCurrentRoute(navigation.getState());
      return {
        tabBarIcon: tabBarIconChat,
        tabBarStyle: {
          borderTopColor:
            currentRoute.name === ScreenID.PinPostScreen ||
            currentRoute.params?.drawerStatus === 'open'
              ? colors.border
              : colors.background,
          backgroundColor: colors.background,
        },
      };
    },
    [colors.background, colors.border, tabBarIconChat],
  );
  return (
    <>
      <Tab.Navigator
        initialRouteName={StackID.ConversationStack}
        screenOptions={screenOptions}>
        <Tab.Screen
          options={{tabBarIcon: tabBarIconHome}}
          name={ScreenID.CommunityScreen}
          component={SideBarCommunity}
        />
        <Tab.Screen
          options={conversationOptions}
          name={StackID.ConversationStack}
          component={ConversationStack}
          initialParams={route.params}
        />
        <Tab.Screen
          options={{
            tabBarIcon: tabBarIconWallet,
            header: () => <WalletHeader />,
          }}
          name={ScreenID.WalletScreen}
          component={WalletScreen}
        />
        <Tab.Screen
          options={{tabBarIcon: tabBarIconNotification}}
          name={ScreenID.NotificationScreen}
          component={NotificationScreen}
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
