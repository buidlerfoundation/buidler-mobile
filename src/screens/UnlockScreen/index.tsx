import React, {memo, useState} from 'react';
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
import {getPrivateChannel} from 'helpers/ChannelHelper';
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

const UnlockScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [pass, setPass] = useState('');
  const {colors} = useThemeColor();
  const dispatch = useDispatch();
  const user = useAppSelector(state => state.user.userData);
  const [loading, setLoading] = useState(false);
  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);
  const handleAccessToHome = useCallback(
    async (iv: string) => {
      try {
        const encryptedStr: any = await AsyncStorage.getItem(
          AsyncKey.encryptedDataKey,
        );
        const decryptedStr = decryptString(encryptedStr, pass, iv);
        if (!decryptedStr) {
          alert('Invalid Password');
        } else {
          const json = JSON.parse(decryptedStr);
          const privateKey = json?.[user.user_id];
          dispatch({
            type: actionTypes.SET_PRIVATE_KEY,
            payload: privateKey,
          });
          const privateKeyChannel = await getPrivateChannel(privateKey);
          dispatch({
            type: actionTypes.SET_CHANNEL_PRIVATE_KEY,
            payload: privateKeyChannel,
          });
          await dispatch(accessToHome());
        }
      } catch (error) {
        alert('Invalid Password');
      }
    },
    [dispatch, pass, user.user_id],
  );
  const handleBackup = useCallback(
    (iv: string, encryptedStr) => {
      try {
        const decryptedStr = decryptString(encryptedStr, pass, iv);
        if (!decryptedStr) {
          alert('Invalid Password');
        } else {
          const json = JSON.parse(decryptedStr);
          const seed = json?.[user.user_id];
          navigation.navigate(ScreenID.ProfileScreen, {seed});
        }
      } catch (error) {
        alert('Invalid Password');
      }
    },
    [navigation, pass, user.user_id],
  );
  const checkPassword = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    const iv = await getIV();
    if (route.params?.backupData) {
      await handleBackup(iv, route.params?.backupData);
    } else {
      await handleAccessToHome(iv);
    }
    setLoading(false);
  }, [loading, route.params?.backupData, handleBackup, handleAccessToHome]);
  if (!user) return <View style={styles.container} />;

  return (
    <KeyboardLayout>
      <View style={styles.container}>
        <View style={styles.body}>
          {route.params?.backupData && (
            <Touchable
              style={styles.backButton}
              useReactNative
              onPress={goBack}>
              <SVG.IconArrowBack />
            </Touchable>
          )}
          <AvatarView user={user} withStatus={false} size={120} />
          <Text style={[styles.userName, {color: colors.text}]}>
            {user?.user_name}
          </Text>
          <TextInput
            autoFocus
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
        <Touchable
          style={[styles.buttonUnlock, {backgroundColor: colors.primary}]}
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
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  userName: {
    marginTop: 15,
    fontFamily: Fonts.Bold,
    fontSize: 16,
    lineHeight: 19,
  },
  input: {
    paddingVertical: 12,
    marginTop: 35,
    fontFamily: Fonts.SemiBold,
    fontSize: 16,
    borderWidth: 1,
    borderRadius: 5,
    width: '100%',
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
});

export default memo(UnlockScreen);
