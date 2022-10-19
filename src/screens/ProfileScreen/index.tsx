import AppDimension from 'common/AppDimension';
import Fonts from 'common/Fonts';
import SVG from 'common/SVG';
import Touchable from 'components/Touchable';
import useThemeColor from 'hook/useThemeColor';
import useUserData from 'hook/useUserData';
import React, {memo, useCallback} from 'react';
import {View, StyleSheet, Text, Alert} from 'react-native';
import useAppDispatch from 'hook/useAppDispatch';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {logout} from 'actions/UserActions';
import NavigationServices from 'services/NavigationServices';
import {StackID} from 'common/ScreenID';
import {getDeviceCode} from 'helpers/GenerateUUID';
import api from 'services/api';
import UserInfo from 'components/UserInfo';

const ProfileScreen = () => {
  const dispatch = useAppDispatch();
  const {colors} = useThemeColor();
  const userData = useUserData();
  const onLogout = useCallback(async () => {
    const deviceCode = await getDeviceCode();
    await api.removeDevice({
      device_code: deviceCode,
    });
    await AsyncStorage.clear();
    dispatch(logout());
    NavigationServices.reset(StackID.AuthStack);
  }, [dispatch]);
  const onDeleteAccount = useCallback(() => {
    onLogout();
  }, [onLogout]);
  const onDeleteAccountPress = useCallback(() => {
    Alert.alert('Alert', 'are you sure you want to delete your account?', [
      {text: 'Cancel'},
      {text: 'Delete', style: 'destructive', onPress: onDeleteAccount},
    ]);
  }, [onDeleteAccount]);
  return (
    <View style={styles.container}>
      <UserInfo userData={userData} />
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
        <Touchable
          style={[
            styles.actionItem,
            {backgroundColor: colors.activeBackgroundLight},
          ]}
          onPress={onDeleteAccountPress}>
          <SVG.IconMenuDelete />
          <Text style={[styles.actionLabel, {color: colors.text}]}>
            Delete Account
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
