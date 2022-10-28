import AvatarView from 'components/AvatarView';
import Touchable from 'components/Touchable';
import useThemeColor from 'hook/useThemeColor';
import {UserData} from 'models';
import React, {memo, useCallback, useMemo} from 'react';
import {View, StyleSheet, Text, ViewStyle} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import Toast from 'react-native-toast-message';
import {utils} from 'ethers';
import AppStyles from 'common/AppStyles';
import SVG from 'common/SVG';
import {normalizeUserName} from 'helpers/MessageHelper';

type UserInfoProps = {
  userData: UserData;
  style?: ViewStyle;
  userInfoStyle?: ViewStyle;
};

const UserInfo = ({userData, style, userInfoStyle}: UserInfoProps) => {
  const {colors} = useThemeColor();
  const address = useMemo(() => {
    if (!userData?.user_id) return '';
    return utils.computeAddress(userData.user_id);
  }, [userData.user_id]);
  const onCopyAddress = useCallback(async () => {
    await Clipboard.setString(address);
    Toast.show({type: 'customSuccess', props: {message: 'Copied'}});
  }, [address]);
  return (
    <View style={[styles.container, style]}>
      <View style={styles.avatarWrap}>
        <View style={[styles.cover, {backgroundColor: colors.text}]} />
        {(userData.is_verified_avatar || userData.is_verified_username) && (
          <View style={styles.verifyContainer}>
            <Text
              style={[
                AppStyles.TextSemi15,
                {color: colors.text, marginRight: 8},
              ]}>
              Verified Account
            </Text>
            <SVG.IconVerifyBadge fill={colors.text} width={15} height={15} />
          </View>
        )}
        <View style={[styles.avatar, {borderColor: colors.background}]}>
          <AvatarView user={userData} size={84} />
          {(userData.role === 'Owner' || userData.role === 'Admin') && (
            <View
              style={[
                styles.roleContainer,
                {backgroundColor: colors.activeBackgroundLight},
              ]}>
              {userData.role === 'Owner' ? (
                <SVG.IconCrow fill={colors.doing} />
              ) : (
                <SVG.IconShieldStar fill={colors.success} />
              )}
              <Text
                style={[
                  AppStyles.TextMed13,
                  {color: colors.text, marginLeft: 8},
                ]}>
                {userData.role}
              </Text>
            </View>
          )}
        </View>
      </View>
      <View
        style={[
          styles.userInfoWrap,
          {backgroundColor: colors.activeBackgroundLight},
          userInfoStyle,
        ]}>
        <View style={{flex: 1}}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={[AppStyles.TextBold20, {color: colors.text}]}>
              {userData.user_name}
            </Text>
          </View>
          <Touchable style={styles.address} onPress={onCopyAddress}>
            <Text
              style={[
                AppStyles.TextMed15,
                {color: colors.subtext, marginRight: 4},
              ]}>
              {normalizeUserName(address, 7)}
            </Text>
            <SVG.IconCopy fill={colors.subtext} />
          </Touchable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
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
  address: {
    marginTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleContainer: {
    position: 'absolute',
    height: 26,
    bottom: 10,
    left: 58,
    borderRadius: 13,
    paddingHorizontal: 8,
    alignItems: 'center',
    flexDirection: 'row',
  },
  verifyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 30,
    borderRadius: 5,
    backgroundColor: '#191919B2',
    paddingHorizontal: 10,
    position: 'absolute',
    top: 25,
    right: 25,
  },
});

export default memo(UserInfo);
