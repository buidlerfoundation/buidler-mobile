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
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import AppStyles from 'common/AppStyles';
import {
  getCredentials,
  removeCredentials,
  storeCredentials,
} from 'services/keychain';
import {biometricAuthenticate, isBiometricAvailable} from 'services/biometric';
import SwitchButton from 'components/SwitchButton';
import useAppSelector from 'hook/useAppSelector';
import {LoginType} from 'common/AppConfig';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [biometricType, setShowBiometricType] = useState<string | null>(null);
  const [toggleBiometric, setToggleBiometric] = useState(false);
  const [isOpenConfirmLogout, setOpenConfirmLogout] = useState(false);
  const [isOpenConfirmDelete, setOpenConfirmDelete] = useState(false);
  const [badgeBackup, setBadgeBackup] = useState(false);
  const [backupData, setBackupData] = useState(null);
  const dispatch = useAppDispatch();
  const {colors} = useThemeColor();
  const userData = useUserData();
  const loginType = useAppSelector(state => state.configs.loginType);
  useEffect(() => {
    getCredentials().then(res => {
      if (res) {
        setToggleBiometric(true);
      }
    });
  }, []);
  useEffect(() => {
    isBiometricAvailable().then(res => {
      setShowBiometricType(res.biometryType);
    });
  }, []);
  useEffect(() => {
    if (route.params?.seed) {
      setBadgeBackup(false);
      AsyncStorage.setItem(AsyncKey.isBackup, 'true');
      navigation.navigate(ScreenID.BackupDataScreen, {
        backupSeed: route.params?.seed,
      });
    }
  }, [navigation, route.params]);
  useFocusEffect(
    useCallback(() => {
      const initialDataBackup = async () => {
        const isBackup = await AsyncStorage.getItem(AsyncKey.isBackup);
        let dataBackup = await AsyncStorage.getItem(AsyncKey.encryptedSeedKey);
        if (!dataBackup) {
          dataBackup = await AsyncStorage.getItem(AsyncKey.encryptedDataKey);
        }
        setBadgeBackup(isBackup === 'false');
        setBackupData(dataBackup);
      };
      initialDataBackup();
    }, []),
  );
  useEffect(() => {
    if (route.params?.password) {
      const pass = route.params?.password;
      biometricAuthenticate().then(res => {
        if (res.success) {
          if (toggleBiometric) {
            setToggleBiometric(false);
            removeCredentials();
          } else {
            storeCredentials(pass);
            setToggleBiometric(true);
          }
        }
      });
      navigation.setParams({password: null});
    }
  }, [navigation, route.params?.password, toggleBiometric]);
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
    navigation.navigate(ScreenID.BackupDataScreen, {backupData});
  }, [backupData, navigation]);
  const onBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);
  const toggleFaceID = useCallback(async () => {
    navigation.navigate(ScreenID.UnlockScreen, {toggleBiometric: true});
  }, [navigation]);
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Touchable onPress={onBack}>
          <SVG.IconArrowBack fill={colors.text} />
        </Touchable>
        <Text
          style={[styles.title, AppStyles.TextBold17, {color: colors.text}]}
          numberOfLines={1}
          ellipsizeMode="tail">
          {userData.user_name}
        </Text>
      </View>
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
            {badgeBackup && (
              <Text
                style={[
                  AppStyles.TextMed14,
                  {color: colors.subtext, marginRight: 5, marginLeft: 15},
                ]}>
                Incompleted
              </Text>
            )}
            <SVG.IconArrowRight fill={colors.subtext} />
          </Touchable>
        )}
        {loginType !== LoginType.WalletConnect && biometricType && (
          <Touchable
            style={[
              styles.actionItem,
              {backgroundColor: colors.activeBackgroundLight},
            ]}
            onPress={toggleFaceID}>
            <SVG.IconMenuBiometry />
            <Text style={[styles.actionLabel, {color: colors.text}]}>
              Unlock with {biometricType}
            </Text>
            <SwitchButton toggleOn={toggleBiometric} readonly />
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
