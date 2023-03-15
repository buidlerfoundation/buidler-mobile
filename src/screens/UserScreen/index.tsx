import Clipboard from '@react-native-clipboard/clipboard';
import {useNavigation, useRoute} from '@react-navigation/native';
import {actionTypes} from 'actions/actionTypes';
import {setCurrentDirectChannel} from 'actions/UserActions';
import AppConfig from 'common/AppConfig';
import AppDimension from 'common/AppDimension';
import AppStyles from 'common/AppStyles';
import ScreenID, {StackID} from 'common/ScreenID';
import SVG from 'common/SVG';
import MenuConfirm from 'components/MenuConfirm';
import MenuConfirmStartDM from 'components/MenuConfirmStartDM';
import MenuUser from 'components/MenuUser';
import ModalBottom from 'components/ModalBottom';
import Spinner from 'components/Spinner';
import Touchable from 'components/Touchable';
import {createMemberChannelData} from 'helpers/ChannelHelper';
import useAppDispatch from 'hook/useAppDispatch';
import useCommunityId from 'hook/useCommunityId';
import useDirectUser from 'hook/useDirectUser';
import useThemeColor from 'hook/useThemeColor';
import useUserData from 'hook/useUserData';
import {UserData} from 'models';
import React, {memo, useCallback, useEffect, useMemo, useState} from 'react';
import {Linking, StyleSheet, Text, View} from 'react-native';
import {PROFILE_BASE_URL} from 'react-native-dotenv';
import Toast from 'react-native-toast-message';
import WebView, {WebViewMessageEvent} from 'react-native-webview';
import {ShouldStartLoadRequest} from 'react-native-webview/lib/WebViewTypes';
import api from 'services/api';
import SocketUtils from 'utils/SocketUtils';

const UserScreen = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const userData = useUserData();
  const [userProfile, setUserProfile] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);
  const route = useRoute();
  const direct = useMemo(() => route.params?.direct, [route.params?.direct]);
  const communityId = useCommunityId(direct);
  const isMine = useMemo(
    () => userData.user_id === route.params?.userId,
    [route.params?.userId, userData.user_id],
  );
  const directUser = useDirectUser(route.params?.userId);
  const {colors} = useThemeColor();
  const [isOpenMenu, setOpenMenu] = useState(false);
  const [isOpenConfirmBlock, setOpenConfirmBlock] = useState(false);
  const [isOpenConfirmDM, setOpenConfirmDM] = useState(false);
  const onBack = useCallback(() => navigation.goBack(), [navigation]);
  const onPressMenu = useCallback(() => {
    setOpenMenu(true);
  }, []);
  const getDirectMessageIdFromApi = useCallback(async () => {
    setCreating(true);
    let directChannelId = '';
    const channelMemberData = await createMemberChannelData([
      userData,
      userProfile,
    ]);
    const body = {
      channel_type: 'Direct',
      channel_member_data: channelMemberData.res,
    };
    const res = await api.createDirectChannel(
      AppConfig.directCommunityId,
      body,
    );
    if (res.statusCode === 200) {
      directChannelId = res.data?.channel_id;
      const myKey = channelMemberData.res.find(
        el => el.user_id === userData.user_id,
      );
      if (myKey) {
        await SocketUtils.handleChannelPrivateKey(
          directChannelId,
          myKey.key,
          myKey.timestamp,
        );
      }
      dispatch({
        type: actionTypes.NEW_DIRECT_USER,
        payload: [{...userProfile, direct_channel_id: directChannelId}],
      });
      dispatch({
        type: actionTypes.NEW_CHANNEL,
        payload: {...res.data, seen: true},
      });
    }
    setCreating(false);
    return directChannelId;
  }, [dispatch, userData, userProfile]);
  const startDM = useCallback(
    async (directChannelId?: string) => {
      let dmChannelId = directChannelId;
      if (!dmChannelId) {
        dmChannelId = await getDirectMessageIdFromApi();
      }
      if (dmChannelId) {
        dispatch(setCurrentDirectChannel({channel_id: dmChannelId}));
        navigation.navigate(StackID.DirectMessageStack);
      }
      onCloseConfirmDM();
    },
    [dispatch, getDirectMessageIdFromApi, navigation, onCloseConfirmDM],
  );
  const handleStartDM = useCallback(() => {
    startDM();
  }, [startDM]);
  const onDirectMessage = useCallback(async () => {
    if (directUser?.direct_channel_id) {
      startDM(directUser?.direct_channel_id);
    } else {
      setOpenConfirmDM(true);
    }
  }, [directUser?.direct_channel_id, startDM]);
  const onSendCrypto = useCallback(() => {
    Toast.show({type: 'customInfo', props: {message: 'Coming soon!'}});
  }, []);
  const onCloseMenu = useCallback(() => setOpenMenu(false), []);
  const onCloseConfirmDM = useCallback(() => setOpenConfirmDM(false), []);
  const onCloseConfirmBlock = useCallback(() => setOpenConfirmBlock(false), []);
  const fetchUserProfileById = useCallback(async () => {
    const userId = route.params?.userId;
    setLoading(true);
    const res = await api.getUserDetail(userId, communityId);
    if (res.success) {
      setUserProfile(res.data);
    } else {
      setError(res.message);
    }
    setLoading(false);
  }, [communityId, route.params?.userId]);
  useEffect(() => {
    fetchUserProfileById();
  }, [fetchUserProfileById]);
  useEffect(() => {
    const userId = route.params?.userId;
    if (userId && error) {
      onBack();
      Toast.show({
        type: 'customError',
        props: {message: error},
      });
    }
  }, [onBack, route.params?.userId, error]);
  const onBlock = useCallback(() => {
    api.blockUser(userProfile?.user_id);
    setUserProfile(current => ({...current, is_blocked: true}));
    onCloseConfirmBlock();
  }, [onCloseConfirmBlock, userProfile?.user_id]);
  const onUnblock = useCallback(() => {
    api.unblockUser(userProfile?.user_id);
    setUserProfile(current => ({...current, is_blocked: false}));
  }, [userProfile?.user_id]);
  const onBlockUserPress = useCallback(() => {
    if (userProfile?.is_blocked) {
      onUnblock();
    } else {
      onCloseMenu();
      setTimeout(() => {
        setOpenConfirmBlock(true);
      }, AppConfig.timeoutCloseBottomSheet);
    }
  }, [onCloseMenu, onUnblock, userProfile?.is_blocked]);
  const onEditPress = useCallback(() => {}, []);
  const handleMessage = useCallback(
    async (event: WebViewMessageEvent) => {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'direct_message') {
        onDirectMessage();
      }
      if (data.type === 'send_crypto') {
        onSendCrypto();
      }
      if (data.type === 'view_avatar') {
        if (data.payload) {
          navigation.navigate(ScreenID.NFTDetailScreen, {
            contractAddress: data.payload.contract_address,
            tokenId: data.payload.token_id,
            network: data.payload.network,
          });
        }
      }
      if (data.type === 'view_nft') {
        navigation.navigate(ScreenID.NFTDetailScreen, {
          contractAddress: data.payload.contract_address,
          tokenId: data.payload.token_id,
          network: data.payload.network,
        });
      }
      if (data.type === 'copy') {
        await Clipboard.setString(data.payload);
        Toast.show({type: 'customSuccess', props: {message: 'Copied'}});
      }
    },
    [navigation, onDirectMessage, onSendCrypto],
  );
  const onShouldStartLoadWithRequest = useCallback(
    (evt: ShouldStartLoadRequest) => {
      if (evt.url.includes(PROFILE_BASE_URL)) return true;
      Linking.openURL(evt.url);
      return false;
    },
    [],
  );
  const onWVLoadEnd = useCallback(() => {
    setTimeout(() => {
      setLoaded(true);
    }, 200);
  }, []);
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Touchable onPress={onBack}>
          <SVG.IconArrowBack fill={colors.text} />
        </Touchable>
        <Text
          style={[styles.title, AppStyles.TextBold17, {color: colors.text}]}>
          Profile Detail
        </Text>
        <Touchable onPress={onPressMenu}>
          <SVG.IconMore fill={colors.text} />
        </Touchable>
      </View>
      {userProfile && (
        <WebView
          source={{
            uri: `${PROFILE_BASE_URL}/${userProfile.user_name}?embedded=true&mine=${isMine}&bottom=${AppDimension.extraBottom}`,
          }}
          style={{backgroundColor: colors.background}}
          onMessage={handleMessage}
          onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
          onLoadEnd={onWVLoadEnd}
          showsVerticalScrollIndicator={false}
          decelerationRate={1}
        />
      )}
      {(!loaded || loading) && (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: colors.background,
              top: AppDimension.headerHeight + AppDimension.extraTop,
            },
          ]}>
          <Spinner />
        </View>
      )}
      <ModalBottom
        isVisible={isOpenMenu}
        onSwipeComplete={onCloseMenu}
        onBackdropPress={onCloseMenu}>
        <MenuUser
          user={userProfile}
          onClose={onCloseMenu}
          onBlockPress={onBlockUserPress}
          onEditPress={onEditPress}
        />
      </ModalBottom>
      <ModalBottom
        isVisible={isOpenConfirmBlock}
        onSwipeComplete={onCloseConfirmBlock}
        onBackdropPress={onCloseConfirmBlock}>
        <MenuConfirm
          user={userProfile}
          onClose={onCloseConfirmBlock}
          onConfirm={onBlock}
          confirmLabel="Block"
          message="Are you sure you want to block this user?"
        />
      </ModalBottom>
      <ModalBottom
        isVisible={isOpenConfirmDM}
        onSwipeComplete={onCloseConfirmDM}
        onBackdropPress={onCloseConfirmDM}>
        <MenuConfirmStartDM
          user={userProfile}
          onClose={onCloseConfirmDM}
          startDM={handleStartDM}
          creating={creating}
        />
      </ModalBottom>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: AppDimension.extraTop,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: AppDimension.headerHeight,
  },
  title: {
    marginLeft: 20,
    flex: 1,
  },
  userInfoWrap: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    backgroundColor: 'transparent',
  },
  bottomButton: {
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    flex: 1,
  },
  bottom: {
    marginTop: 20,
    marginBottom: 20 + AppDimension.extraBottom,
    marginHorizontal: 20,
    flexDirection: 'row',
  },
  verifyContainer: {
    marginTop: 20,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 5,
    borderWidth: 1,
    marginHorizontal: 20,
  },
  verifyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  verifyIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
});

export default memo(UserScreen);
