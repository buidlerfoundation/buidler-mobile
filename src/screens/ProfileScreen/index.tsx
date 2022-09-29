import AppDimension from 'common/AppDimension';
import Fonts from 'common/Fonts';
import SVG from 'common/SVG';
import AvatarView from 'components/AvatarView';
import Touchable from 'components/Touchable';
import {utils} from 'ethers';
import {normalizeUserName} from 'helpers/MessageHelper';
import useThemeColor from 'hook/useThemeColor';
import useUserData from 'hook/useUserData';
import React, {memo, useCallback, useMemo} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import Toast from 'react-native-toast-message';
import useAppDispatch from 'hook/useAppDispatch';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {logout} from 'actions/UserActions';
import NavigationServices from 'services/NavigationServices';
import {StackID} from 'common/ScreenID';

const ProfileScreen = () => {
  const dispatch = useAppDispatch();
  const {colors} = useThemeColor();
  const userData = useUserData();
  const address = useMemo(() => {
    if (!userData?.user_id) return '';
    return utils.computeAddress(userData.user_id);
  }, [userData.user_id]);
  const onCopyAddress = useCallback(async () => {
    await Clipboard.setString(address);
    Toast.show({type: 'customSuccess', props: {message: 'Copied'}});
  }, [address]);
  const onLogout = useCallback(async () => {
    await AsyncStorage.clear();
    dispatch(logout());
    NavigationServices.reset(StackID.AuthStack);
  }, [dispatch]);
  return (
    <View style={styles.container}>
      <View style={styles.avatarWrap}>
        <View style={[styles.cover, {backgroundColor: colors.text}]} />
        <View style={[styles.avatar, {borderColor: colors.background}]}>
          <AvatarView user={userData} size={84} />
        </View>
      </View>
      <Touchable
        style={[
          styles.userInfoWrap,
          {backgroundColor: colors.activeBackgroundLight},
        ]}
        onPress={onCopyAddress}>
        <View style={{flex: 1}}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={[styles.userName, {color: colors.text}]}>
              {userData.user_name}
            </Text>
            {userData.is_verified_avatar ||
              (userData.is_verified_username && (
                <SVG.IconVerifyBadge fill={colors.text} />
              ))}
          </View>
          <Text style={[styles.address, {color: colors.subtext}]}>
            {normalizeUserName(address, 7)}
          </Text>
        </View>
      </Touchable>
      <View style={styles.userActionWrap}>
        <Touchable
          style={[
            styles.actionItem,
            {backgroundColor: colors.activeBackgroundLight},
          ]}
          onPress={onLogout}>
          <SVG.IconMenuLogout />
          <Text style={[styles.actionLabel, {color: colors.text}]}>
            Log out
          </Text>
          <SVG.IconArrowRight fill={colors.subtext} />
        </Touchable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, paddingTop: AppDimension.extraTop},
  avatarWrap: {
    padding: 10,
  },
  cover: {
    height: 160,
    borderRadius: 5,
  },
  avatar: {
    width: 94,
    height: 94,
    borderRadius: 47,
    borderWidth: 5,
    position: 'absolute',
    bottom: -40,
    left: 25,
  },
  userInfoWrap: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 60,
    marginHorizontal: 20,
  },
  userName: {
    fontSize: 20,
    fontFamily: Fonts.Bold,
    lineHeight: 24,
    marginRight: 10,
  },
  address: {
    fontSize: 14,
    fontFamily: Fonts.SemiBold,
    lineHeight: 22,
    marginTop: 5,
  },
  userActionWrap: {
    margin: 20,
    borderRadius: 5,
    overflow: 'hidden',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 50,
  },
  actionLabel: {
    flex: 1,
    fontSize: 16,
    fontFamily: Fonts.SemiBold,
    lineHeight: 20,
    marginLeft: 15,
  },
});

export default memo(ProfileScreen);
