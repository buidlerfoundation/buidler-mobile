import AppDimension from 'common/AppDimension';
import Fonts from 'common/Fonts';
import SVG from 'common/SVG';
import Touchable from 'components/Touchable';
import React, {memo, useCallback, useEffect} from 'react';
import {View, StyleSheet, Text, Linking} from 'react-native';
import NavigationServices from 'services/NavigationServices';
import ScreenID from 'common/ScreenID';
import useThemeColor from 'hook/useThemeColor';
import GlobalVariable from 'services/GlobalVariable';
import AppStyles from 'common/AppStyles';
import {buidlerHomeURL} from 'helpers/LinkHelper';
import {removeCredentials} from 'services/keychain';

const LoginScreen = () => {
  const {colors} = useThemeColor();
  const onCreatePress = useCallback(() => {
    GlobalVariable.sessionExpired = false;
    NavigationServices.pushToScreen(ScreenID.CreatePasswordScreen);
  }, []);
  const onImportPress = useCallback(() => {
    GlobalVariable.sessionExpired = false;
    NavigationServices.pushToScreen(ScreenID.ImportSeedPhraseScreen);
  }, []);
  const onTermPress = useCallback(() => {
    Linking.openURL(`${buidlerHomeURL}/terms`);
  }, []);
  const onPrivacyPress = useCallback(() => {
    Linking.openURL(`${buidlerHomeURL}/privacy`);
  }, []);
  useEffect(() => {
    removeCredentials();
  }, []);
  return (
    <View style={styles.container}>
      <SVG.Logo width={90} height={90} />
      <Text style={[styles.title, {color: colors.text}]}>
        {'A new home\nfor your community\nto buidl together'}
      </Text>
      <Text style={[styles.description, {color: colors.text}]}>
        Web3 application for your community, teams, and supporters to connect,
        communicate and collaborate.
      </Text>
      <Touchable
        useReactNative
        style={[styles.createButton, {backgroundColor: colors.border}]}
        onPress={onCreatePress}>
        <Text style={[styles.text, {color: colors.text}]}>New wallet</Text>
        <View style={styles.plusWrap}>
          <SVG.IconPlus width={16} height={16} fill={colors.text} />
        </View>
      </Touchable>
      <Touchable
        style={[
          styles.createButton,
          {backgroundColor: colors.border, marginTop: 15},
        ]}
        onPress={onImportPress}
        useReactNative>
        <Text style={[styles.text, {color: colors.text}]}>Import wallet</Text>
        <SVG.IconArrowImport fill={colors.text} />
      </Touchable>
      <Text
        style={[AppStyles.TextMed13, {color: colors.subtext, marginTop: 25}]}>
        By connecting wallet, you agree to our{' '}
        <Text style={styles.btnTerm} onPress={onTermPress}>
          Terms
        </Text>{' '}
        and{' '}
        <Text style={styles.btnTerm} onPress={onPrivacyPress}>
          Privacy Policy
        </Text>
        .
      </Text>
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
    fontSize: 31,
    lineHeight: 38,
    fontFamily: Fonts.Bold,
    marginTop: 25,
  },
  description: {
    fontSize: 16,
    lineHeight: 26,
    fontFamily: Fonts.SemiBold,
    marginTop: 25,
  },
  createButton: {
    marginTop: 70,
    borderRadius: 5,
    height: 60,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  importButton: {
    marginTop: 20,
    borderRadius: 5,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    lineHeight: 26,
    fontFamily: Fonts.SemiBold,
  },
  plusWrap: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnTerm: {
    textDecorationLine: 'underline',
  },
});

export default memo(LoginScreen);
