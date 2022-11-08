import AppDimension from 'common/AppDimension';
import Fonts from 'common/Fonts';
import SVG from 'common/SVG';
import Touchable from 'components/Touchable';
import useThemeColor from 'hook/useThemeColor';
import useUserData from 'hook/useUserData';
import React, {memo, useCallback, useEffect, useState} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import useAppDispatch from 'hook/useAppDispatch';
import {logout} from 'actions/UserActions';
import NavigationServices from 'services/NavigationServices';
import ScreenID, {StackID} from 'common/ScreenID';
import api from 'services/api';
import UserInfo from 'components/UserInfo';
import ModalBottom from 'components/ModalBottom';
import MenuConfirm from 'components/MenuConfirm';
import MenuConfirmDeleteAccount from 'components/MenuConfirmDeleteAccount';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AsyncKey} from 'common/AppStorage';
import {useNavigation, useRoute} from '@react-navigation/native';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [isOpenConfirmLogout, setOpenConfirmLogout] = useState(false);
  const [isOpenConfirmDelete, setOpenConfirmDelete] = useState(false);
  const [backupData, setBackupData] = useState(null);
  const dispatch = useAppDispatch();
  const {colors} = useThemeColor();
  const userData = useUserData();
  const initialDataBackup = useCallback(async () => {
    const dataBackup = await AsyncStorage.getItem(AsyncKey.encryptedSeedKey);
    setBackupData(dataBackup);
  }, []);
  useEffect(() => {
    if (route.params?.seed) {
      navigation.navigate(ScreenID.StoreSeedPhraseScreen, {
        backupSeed: route.params?.seed,
      });
    } else {
      setBackupData(null);
    }
  }, [navigation, route.params]);
  useEffect(() => {
    initialDataBackup();
  }, [initialDataBackup]);
  const toggleConfirmLogout = useCallback(
    () => setOpenConfirmLogout(current => !current),
    [],
  );
  const toggleConfirmDelete = useCallback(
    () => setOpenConfirmDelete(current => !current),
    [],
  );
  const onLogout = useCallback(async () => {
    await dispatch(logout());
    NavigationServices.reset(StackID.AuthStack);
  }, [dispatch]);
  const onDeleteAccount = useCallback(() => {
    api.deleteUser();
    onLogout();
  }, [onLogout]);
  const onBackupPress = useCallback(() => {
    navigation.navigate(ScreenID.UnlockScreen, {backupData});
  }, [backupData, navigation]);
  return (
    <View style={styles.container}>
      <UserInfo userData={userData} />
      <View style={styles.userActionWrap}>
        {backupData && (
          <Touchable
            style={[
              styles.actionItem,
              {backgroundColor: colors.activeBackgroundLight},
            ]}
            onPress={onBackupPress}>
            <SVG.IconMenuBackup />
            <Text style={[styles.actionLabel, {color: colors.text}]}>
              Backup
            </Text>
            <View style={[styles.dot, {backgroundColor: colors.mention}]} />
            <SVG.IconArrowRight fill={colors.subtext} />
          </Touchable>
        )}
        <Touchable
          style={[
            styles.actionItem,
            {backgroundColor: colors.activeBackgroundLight},
          ]}
          onPress={toggleConfirmLogout}>
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
          onPress={toggleConfirmDelete}>
          <SVG.IconMenuDelete />
          <Text style={[styles.actionLabel, {color: colors.text}]}>
            Delete Account
          </Text>
          <SVG.IconArrowRight fill={colors.subtext} />
        </Touchable>
      </View>
      <ModalBottom
        isVisible={isOpenConfirmLogout}
        onSwipeComplete={toggleConfirmLogout}
        onBackdropPress={toggleConfirmLogout}>
        <MenuConfirm
          user={userData}
          onClose={toggleConfirmLogout}
          onConfirm={onLogout}
          confirmLabel="Log out"
          message="Are you sure you want to log out?"
        />
      </ModalBottom>
      <ModalBottom
        isVisible={isOpenConfirmDelete}
        onSwipeComplete={toggleConfirmDelete}
        onBackdropPress={toggleConfirmDelete}>
        <MenuConfirmDeleteAccount
          user={userData}
          onClose={toggleConfirmDelete}
          onConfirm={onDeleteAccount}
        />
      </ModalBottom>
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
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: 15,
    marginRight: 10,
  },
});

export default memo(ProfileScreen);
