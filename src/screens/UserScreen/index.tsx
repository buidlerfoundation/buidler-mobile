import {useNavigation, useRoute} from '@react-navigation/native';
import AppDimension from 'common/AppDimension';
import AppStyles from 'common/AppStyles';
import SVG from 'common/SVG';
import MenuUser from 'components/MenuUser';
import ModalBottom from 'components/ModalBottom';
import Spinner from 'components/Spinner';
import Touchable from 'components/Touchable';
import UserInfo from 'components/UserInfo';
import useCommunityId from 'hook/useCommunityId';
import useThemeColor from 'hook/useThemeColor';
import {NFTCollection, UserData} from 'models';
import React, {memo, useCallback, useEffect, useMemo, useState} from 'react';
import {Alert, StyleSheet, Text, View} from 'react-native';
import FastImage from 'react-native-fast-image';
import Toast from 'react-native-toast-message';
import api from 'services/api';

type VerifyItemProps = {
  item: NFTCollection;
};

const VerifyItem = memo(({item}: VerifyItemProps) => {
  const {colors} = useThemeColor();
  return (
    <View style={styles.verifyItem}>
      <FastImage style={styles.verifyIcon} source={{uri: item.image_url}} />
      <Text style={[AppStyles.TextMed15, {color: colors.text, marginLeft: 8}]}>
        {item.name}
      </Text>
    </View>
  );
});

const UserScreen = () => {
  const navigation = useNavigation();
  const [userProfile, setUserProfile] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const communityId = useCommunityId();
  const route = useRoute();
  const {colors} = useThemeColor();
  const [isOpenMenu, setOpenMenu] = useState(false);
  const onBack = useCallback(() => navigation.goBack(), [navigation]);
  const onPressMenu = useCallback(() => {
    setOpenMenu(true);
  }, []);
  const onDirectMessage = useCallback(() => {}, []);
  const onSendCrypto = useCallback(() => {}, []);
  const onCloseMenu = useCallback(() => setOpenMenu(false), []);
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
  }, [userProfile?.user_id]);
  const onUnblock = useCallback(() => {
    api.unblockUser(userProfile?.user_id);
    setUserProfile(current => ({...current, is_blocked: false}));
  }, [userProfile?.user_id]);
  const onBlockUserPress = useCallback(() => {
    if (userProfile?.is_blocked) {
      onUnblock();
    } else {
      Alert.alert('Alert', 'are you sure you want to block this user?', [
        {text: 'Cancel'},
        {text: 'Block', style: 'destructive', onPress: onBlock},
      ]);
    }
  }, [onBlock, onUnblock, userProfile?.is_blocked]);
  const isVerifiedAccount = useMemo(
    () => userProfile?.is_verified_avatar || userProfile?.is_verified_username,
    [userProfile?.is_verified_avatar, userProfile?.is_verified_username],
  );
  const verifyContent = useMemo(() => {
    if (userProfile?.is_verified_avatar && userProfile?.is_verified_username) {
      return 'It is verified that the account owns this ENS domain and NFT profile picture.';
    }
    if (userProfile?.is_verified_avatar) {
      return 'It is verified that the account owns this NFT profile picture.';
    }
    if (userProfile?.is_verified_username) {
      return 'It is verified that the account owns this ENS domain.';
    }
    return '';
  }, [userProfile?.is_verified_avatar, userProfile?.is_verified_username]);
  const Body = useCallback(() => {
    if (loading) return <Spinner />;
    if (userProfile) {
      return (
        <View style={{flex: 1}}>
          <UserInfo
            userData={userProfile}
            userInfoStyle={styles.userInfoWrap}
          />
          {isVerifiedAccount && (
            <View
              style={[styles.verifyContainer, {borderColor: colors.border}]}>
              <Text style={[AppStyles.TextMed15, {color: colors.text}]}>
                {verifyContent}
              </Text>
              {userProfile?.is_verified_avatar && (
                <VerifyItem
                  item={userProfile.verified_avatar_asset_collection}
                />
              )}
              {userProfile?.is_verified_username && (
                <VerifyItem
                  item={userProfile.verified_username_asset_collection}
                />
              )}
            </View>
          )}
        </View>
      );
    }
    return null;
  }, [
    colors.border,
    colors.text,
    isVerifiedAccount,
    loading,
    userProfile,
    verifyContent,
  ]);
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
      <Body />
      <View style={styles.bottom}>
        <Touchable
          useReactNative
          style={[styles.bottomButton, {backgroundColor: colors.primary}]}
          onPress={onDirectMessage}>
          <Text style={[AppStyles.TextSemi16, {color: colors.text}]}>
            Direct Message
          </Text>
        </Touchable>
        <Touchable
          useReactNative
          style={[
            styles.bottomButton,
            {backgroundColor: colors.border, marginTop: 10},
          ]}
          onPress={onSendCrypto}>
          <Text style={[AppStyles.TextSemi16, {color: colors.text}]}>
            Send Crypto
          </Text>
        </Touchable>
      </View>
      <ModalBottom
        isVisible={isOpenMenu}
        onSwipeComplete={onCloseMenu}
        onBackdropPress={onCloseMenu}>
        <MenuUser user={userProfile} onClose={onCloseMenu} />
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
    height: 60,
    marginHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
  },
  bottom: {
    marginTop: 20,
    marginBottom: 20 + AppDimension.extraBottom,
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
