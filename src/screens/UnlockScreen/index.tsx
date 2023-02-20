import React, {memo, useState, useEffect, useRef} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import {useDispatch} from 'react-redux';
import Fonts from 'common/Fonts';
import {decryptString, getIV} from 'utils/DataCrypto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AsyncKey} from 'common/AppStorage';
import {actionTypes} from 'actions/actionTypes';
import KeyboardLayout from 'components/KeyboardLayout';
import Touchable from 'components/Touchable';
import useAppSelector from 'hook/useAppSelector';
import {accessToHome} from 'actions/UserActions';
import {useCallback} from 'react';
import useThemeColor from 'hook/useThemeColor';
import AvatarView from 'components/AvatarView';
import {useNavigation, useRoute} from '@react-navigation/native';
import ScreenID from 'common/ScreenID';
import SVG from 'common/SVG';
import AppDimension from 'common/AppDimension';
import {initialSpaceToggle} from 'actions/SideBarActions';
import {biometricAuthenticate, isBiometricAvailable} from 'services/biometric';
import {getCredentials} from 'services/keychain';
import AppStyles from 'common/AppStyles';

const UnlockScreen = () => {
  const inputRef = useRef<TextInput>();
  const navigation = useNavigation();
  const route = useRoute();
  const [pass, setPass] = useState('');
  const {colors} = useThemeColor();
  const dispatch = useDispatch();
  const user = useAppSelector(state => state.user.userData);
  const [biometricType, setBiometricType] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);
  const handleAccessToHome = useCallback(
    async (iv: string, password: string) => {
      try {
        const encryptedStr: any = await AsyncStorage.getItem(
          AsyncKey.encryptedDataKey,
        );
        const decryptedStr = decryptString(encryptedStr, password, iv);
        if (!decryptedStr) {
          alert('Invalid Password');
        } else {
          const json = JSON.parse(decryptedStr);
          const privateKey = json?.[user.user_id];
          dispatch({
            type: actionTypes.SET_PRIVATE_KEY,
            payload: privateKey,
          });
          dispatch(initialSpaceToggle());
          await dispatch(accessToHome());
        }
      } catch (error) {
        alert('Invalid Password');
      }
    },
    [dispatch, user.user_id],
  );
  const checkIfUsingBiometrics = useCallback(async () => {
    if (route.params?.toggleBiometric) {
      inputRef.current?.focus?.();
      return;
    }
    const credentialFromKeychain = await getCredentials();
    if (credentialFromKeychain) {
      const iv = await getIV();
      const biometricTypeRes = await isBiometricAvailable();
      if (biometricTypeRes.biometryType) {
        inputRef.current?.blur?.();
        setBiometricType(biometricTypeRes.biometryType);
        biometricAuthenticate().then(async res => {
          if (res.success) {
            setLoading(true);
            if (route.params?.backupData) {
              await handleBackup(
                iv,
                route.params?.backupData,
                credentialFromKeychain.password,
              );
            } else {
              await handleAccessToHome(iv, credentialFromKeychain.password);
            }
            setLoading(false);
          } else {
            inputRef.current?.focus?.();
          }
        });
      }
    } else {
      inputRef.current?.focus?.();
    }
  }, [
    handleAccessToHome,
    handleBackup,
    route.params?.backupData,
    route.params?.toggleBiometric,
  ]);
  const handleActiveBiometric = useCallback(
    async (iv: string, password: string) => {
      try {
        const encryptedStr: any = await AsyncStorage.getItem(
          AsyncKey.encryptedDataKey,
        );
        const decryptedStr = decryptString(encryptedStr, password, iv);
        if (!decryptedStr) {
          alert('Invalid Password');
        } else {
          navigation.navigate(ScreenID.ProfileScreen, {password});
        }
      } catch (error) {
        alert('Invalid Password');
      }
    },
    [navigation],
  );
  const handleBackup = useCallback(
    (iv: string, encryptedStr, password = pass) => {
      try {
        const decryptedStr = decryptString(encryptedStr, password, iv);
        if (!decryptedStr) {
          alert('Invalid Password');
        } else {
          const json = JSON.parse(decryptedStr);
          const seed = json?.[user.user_id];
          navigation.navigate(ScreenID.BackupDataScreen, {
            seed,
            backupData: route.params?.backupData,
          });
        }
      } catch (error) {
        alert('Invalid Password');
      }
    },
    [navigation, pass, route.params?.backupData, user.user_id],
  );
  const checkPassword = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    const iv = await getIV();
    if (route.params?.toggleBiometric) {
      await handleActiveBiometric(iv, pass);
    } else if (route.params?.backupData) {
      await handleBackup(iv, route.params?.backupData);
    } else {
      await handleAccessToHome(iv, pass);
    }
    setLoading(false);
  }, [
    loading,
    route.params?.toggleBiometric,
    route.params?.backupData,
    handleActiveBiometric,
    pass,
    handleBackup,
    handleAccessToHome,
  ]);
  useEffect(() => {
    checkIfUsingBiometrics();
  }, [checkIfUsingBiometrics]);
  if (!user) return <View style={styles.container} />;

  return (
    <KeyboardLayout>
      <View style={styles.container}>
        <View style={styles.body}>
          {(route.params?.backupData || route.params?.toggleBiometric) && (
            <Touchable
              style={styles.backButton}
              useReactNative
              onPress={goBack}>
              <SVG.IconArrowBack />
            </Touchable>
          )}
          <AvatarView user={user} withStatus={false} size={90} />
          <Text style={[styles.userName, {color: colors.text}]}>
            {user?.user_name}
          </Text>
          <View style={styles.inputWrapper}>
            <TextInput
              ref={inputRef}
              placeholder="Password"
              textAlign="center"
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={checkPassword}
              blurOnSubmit={false}
              placeholderTextColor={colors.subtext}
              value={pass}
              onChangeText={text => setPass(text)}
              textContentType="oneTimeCode"
              style={[
                styles.input,
                {
                  color: colors.text,
                  backgroundColor: colors.activeBackgroundLight,
                  borderColor: colors.border,
                },
              ]}
            />
          </View>
        </View>
        {biometricType && (
          <Touchable
            style={styles.unlockWithFaceID}
            onPress={checkIfUsingBiometrics}>
            {biometricType === 'FaceID' ? (
              <SVG.IconFaceID fill={colors.subtext} />
            ) : (
              <SVG.IconTouchID fill={colors.subtext} />
            )}
            <Text
              style={[
                AppStyles.TextSemi14,
                {color: colors.subtext, marginLeft: 10},
              ]}>
              Unlock with {biometricType}
            </Text>
          </Touchable>
        )}
        <Touchable
          style={[styles.buttonUnlock, {backgroundColor: colors.blue}]}
          disabled={loading}
          onPress={checkPassword}>
          {loading ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <Text style={[styles.textUnlock, {color: colors.text}]}>
              Unlock
            </Text>
          )}
        </Touchable>
      </View>
    </KeyboardLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 25,
    justifyContent: 'center',
  },
  userName: {
    marginTop: 15,
    fontFamily: Fonts.Bold,
    fontSize: 16,
    lineHeight: 19,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 45,
  },
  input: {
    paddingVertical: 14,
    fontFamily: Fonts.SemiBold,
    fontSize: 16,
    borderWidth: 1,
    borderRadius: 5,
    flex: 1,
  },
  buttonUnlock: {
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  textUnlock: {
    fontSize: 16,
    lineHeight: 19,
    fontFamily: Fonts.SemiBold,
  },
  backButton: {
    position: 'absolute',
    top: AppDimension.extraTop + 25,
    left: 15,
  },
  unlockWithFaceID: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
    alignSelf: 'center',
    marginBottom: 20,
  },
});

export default memo(UnlockScreen);
