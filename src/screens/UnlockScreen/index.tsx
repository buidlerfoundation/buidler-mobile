import React, {memo, useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import {useDispatch} from 'react-redux';
import PushNotificationHelper from 'helpers/PushNotificationHelper';
import NavigationServices from 'services/NavigationServices';
import {DrawerID} from 'common/ScreenID';
import Fonts from 'common/Fonts';
import {decryptString, getIV} from 'utils/DataCrypto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AsyncKey} from 'common/AppStorage';
import {actionTypes} from 'actions/actionTypes';
import {getPrivateChannel} from 'helpers/ChannelHelper';
import KeyboardLayout from 'components/KeyboardLayout';
import Touchable from 'components/Touchable';
import store from '../../store';
import useAppSelector from 'hook/useAppSelector';
import {
  findTeamAndChannel,
  setCurrentChannel,
  setCurrentTeam,
} from 'actions/UserActions';
import {useCallback} from 'react';
import useThemeColor from 'hook/useThemeColor';
import AvatarView from 'components/AvatarView';

const UnlockScreen = () => {
  const [pass, setPass] = useState('');
  const {colors} = useThemeColor();
  const dispatch = useDispatch();
  const user = useAppSelector(state => state.user.userData);
  const [loading, setLoading] = useState(false);
  const accessApp = useCallback(async () => {
    await dispatch(findTeamAndChannel?.());
    let params = {};
    if (
      PushNotificationHelper.initialNotification &&
      PushNotificationHelper.initNotificationData
    ) {
      const {team, currentTeamId, channelMap} = store.getState()?.user;
      const channels = channelMap?.[currentTeamId];
      const {data, type} = PushNotificationHelper.initNotificationData;
      const {team_id} = data.notification_data;
      const {entity_id, entity_type} = data.message_data;
      params = {type, entity_id, entity_type};
      const teamNotification = team?.find?.(t => t.team_id === team_id);
      const channelNotification = channels.find(
        el => el.channel_id === entity_id,
      );
      if (currentTeamId === team_id) {
        if (channelNotification) {
          await dispatch(setCurrentChannel(channelNotification));
        }
      } else if (teamNotification) {
        await dispatch(setCurrentTeam(teamNotification, entity_id));
      }
      PushNotificationHelper.reset();
    }
    NavigationServices.replace(DrawerID.CommunityDrawer, params);
  }, [dispatch]);
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
        await accessApp();
      }
    } catch (error) {
      alert('Invalid Password');
    }
    setLoading(false);
  }, [accessApp, dispatch, pass, user.user_id, loading]);
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
