import AppDimension from 'common/AppDimension';
import Fonts from 'common/Fonts';
import SVG from 'common/SVG';
import Touchable from 'components/Touchable';
import React from 'react';
import {View, StyleSheet, Text} from 'react-native';
import {useTheme} from '@react-navigation/native';
import {utils} from 'ethers';
import RNGoldenKeystore from 'react-native-golden-keystore';

const LoginScreen = () => {
  const {colors} = useTheme();
  const title = 'Your chats is\nYour tasks';
  const onCreatePress = async () => {
    const seed = await RNGoldenKeystore.generateMnemonic();
    const {private_key} = await RNGoldenKeystore.createHDKeyPair(
      seed,
      '',
      RNGoldenKeystore.CoinType.ETH.path,
      0,
    );
    const publicKey = utils.computePublicKey(`0x${private_key}`, true);
    console.log(seed);
    console.log(private_key);
    console.log(publicKey);
  };
  const onImportPress = () => {};
  return (
    <View style={styles.container}>
      <SVG.Logo width={80} height={80} />
      <Text style={[styles.title, {color: colors.text}]}>{title}</Text>
      <Text style={[styles.description, {color: colors.text}]}>
        Buidler is a daily tool for chat, tasks, meeting for remote working.
      </Text>
      <Touchable
        style={[styles.createButton, {backgroundColor: colors.primary}]}
        onPress={onCreatePress}>
        <Text style={[styles.text, {color: colors.text}]}>
          Create a new wallet
        </Text>
      </Touchable>
      <Touchable
        style={[styles.importButton, {backgroundColor: colors.border}]}
        onPress={onImportPress}>
        <Text style={[styles.text, {color: colors.text}]}>
          Import existing wallet
        </Text>
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
  createButton: {
    marginTop: 70,
    borderRadius: 5,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
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
    lineHeight: 19,
    fontFamily: Fonts.SemiBold,
  },
});

export default LoginScreen;
