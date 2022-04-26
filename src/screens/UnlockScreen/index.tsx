import React, {useState} from 'react';
import {View, StyleSheet, Text, TextInput} from 'react-native';
import {useTheme} from '@react-navigation/native';
import {connect, useDispatch, useSelector} from 'react-redux';
import {bindActionCreators} from 'redux';
import actions from 'actions';
import PushNotificationHelper from 'helpers/PushNotificationHelper';
import {Team} from 'models';
import NavigationServices from 'services/NavigationServices';
import {StackID} from 'common/ScreenID';
import FastImage from 'react-native-fast-image';
import Blockies from 'components/Blockies';
import ImageHelper from 'helpers/ImageHelper';
import Fonts from 'common/Fonts';
import {decryptString, getIV} from 'utils/DataCrypto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AsyncKey} from 'common/AppStorage';
import {actionTypes} from 'actions/actionTypes';
import {getPrivateChannel} from 'helpers/ChannelHelper';

type UnlockScreenProps = {
  findTeamAndChannel?: () => any;
  setCurrentTeam?: (team: Team, channelId?: string) => any;
};

const UnlockScreen = ({
  findTeamAndChannel,
  setCurrentTeam,
}: UnlockScreenProps) => {
  const [pass, setPass] = useState('');
  const {colors} = useTheme();
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.user.userData);
  const team = useSelector((state: any) => state.user.team);
  const accessApp = async () => {
    await findTeamAndChannel?.();
    let params = {};
    if (
      PushNotificationHelper.initialNotification &&
      PushNotificationHelper.initNotificationData
    ) {
      const {data, type} = PushNotificationHelper.initNotificationData;
      params = {type};
      const {team_id} = data.notification_data;
      const {channel_id} = data.message_data;
      const teamNotification = team?.find?.((t: Team) => t.team_id === team_id);
      if (teamNotification) {
        await setCurrentTeam(teamNotification, channel_id);
      }
      PushNotificationHelper.reset();
    }
    NavigationServices.replace(StackID.HomeStack, params);
  };
  const checkPassword = async () => {
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
        accessApp();
      }
    } catch (error) {
      alert('Invalid Password');
    }
  };
  if (!user) return <View style={styles.container} />;
  const data = ImageHelper.normalizeAvatar(user?.avatar_url, user?.user_id);
  return (
    <View style={styles.container}>
      {typeof data === 'string' ? (
        <FastImage
          style={{width: 100, height: 100, borderRadius: 50, marginTop: 60}}
          source={{
            uri: data,
          }}
        />
      ) : (
        <Blockies
          blockies={data.address}
          size={8}
          style={{width: 100, height: 100, borderRadius: 50}}
        />
      )}
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
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: 20,
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
});

const mapActionsToProps = (dispatch: any) =>
  bindActionCreators(actions, dispatch);

export default connect(undefined, mapActionsToProps)(UnlockScreen);
