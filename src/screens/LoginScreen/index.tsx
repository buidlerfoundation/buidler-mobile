import actions from 'actions';
import AppDimension from 'common/AppDimension';
import Fonts from 'common/Fonts';
import SVG from 'common/SVG';
import Touchable from 'components/Touchable';
import {ThemeType} from 'models';
import React from 'react';
import {View, StyleSheet, Text, Image, Platform} from 'react-native';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import themes from 'themes';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import NavigationServices from 'services/NavigationServices';
import {StackID} from 'common/ScreenID';
import PushNotificationHelper from 'helpers/PushNotificationHelper';

type LoginScreenProps = {
  themeType: ThemeType;
  login: (accessToken: string, callback: (res: boolean) => void) => boolean;
  findTeamAndChannel?: () => any;
  getInitial?: () => any;
};

const LoginScreen = ({
  themeType,
  login,
  findTeamAndChannel,
  getInitial,
}: LoginScreenProps) => {
  const {colors} = themes[themeType];
  const title = 'Today\nis a new day';
  const onGoogleLogin = async () => {
    try {
      if (Platform.OS === 'ios') {
        await GoogleSignin.configure();
      } else {
        await GoogleSignin.configure({
          webClientId:
            '5581270904-hjbadilhbi84ag2enn82fvu9donbll07.apps.googleusercontent.com',
        });
      }
      await GoogleSignin.signOut();
      const userInfo = await GoogleSignin.signIn();
      NavigationServices.showLoading();
      login(userInfo.idToken, async res => {
        if (res) {
          await Promise.all([getInitial(), findTeamAndChannel()]);
          await PushNotificationHelper.init();
          NavigationServices.hideLoading();
          NavigationServices.replace(StackID.HomeStack);
        }
      });
      console.log(userInfo);
    } catch (e) {
      console.log(e);
      NavigationServices.hideLoading();
    }
  };
  return (
    <View style={styles.container}>
      <SVG.Logo width={80} height={80} />
      <Text style={[styles.title, {color: colors.text}]}>{title}</Text>
      <Text style={[styles.description, {color: colors.text}]}>
        Remote Today is a daily tool for chat, tasks, meeting for remote
        working.
      </Text>
      <Touchable style={styles.loginButton} onPress={onGoogleLogin}>
        <Image source={require('assets/images/logo_google.png')} />
        <Text style={styles.loginGoogleText}>Sign in with Google</Text>
      </Touchable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: AppDimension.extraTop,
    justifyContent: 'center',
    flex: 1,
    paddingHorizontal: 40,
  },
  loginButton: {
    flexDirection: 'row',
    height: 60,
    alignItems: 'center',
    paddingHorizontal: 30,
    backgroundColor: 'white',
    borderRadius: 5,
    marginTop: 40,
  },
  loginGoogleText: {
    fontSize: 16,
    lineHeight: 19,
    fontFamily: Fonts.SemiBold,
    color: '#121212',
    marginLeft: 32,
  },
  title: {
    fontSize: 34,
    lineHeight: 40,
    fontFamily: Fonts.Bold,
    marginTop: 30,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Fonts.SemiBold,
    marginTop: 30,
  },
});

const mapStateToProps = (state: any) => {
  return {
    themeType: state.configs.theme,
  };
};

const mapActionsToProps = (dispatch: any) =>
  bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapActionsToProps)(LoginScreen);
