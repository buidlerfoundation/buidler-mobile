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

const UnlockScreen = () => {
  const [pass, setPass] = useState('');
  const {colors} = useThemeColor();
  const dispatch = useDispatch();
  const user = useAppSelector(state => state.user.userData);
  const [loading, setLoading] = useState(false);
  const checkPassword = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const iv = await getIV();
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
    setLoading(false);
  }, [dispatch, pass, user.user_id, loading]);
  if (!user) return <View style={styles.container} />;

  return (
    <KeyboardLayout>
      <View style={styles.container}>
        <View style={styles.body}>
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
            placeholderTextColor={colors.subtext}
            value={pass}
            onChangeText={text => setPass(text)}
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
});

export default memo(UnlockScreen);
