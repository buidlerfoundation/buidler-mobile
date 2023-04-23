import AppDimension from 'common/AppDimension';
import Fonts from 'common/Fonts';
import SVG from 'common/SVG';
import Touchable from 'components/Touchable';
import React, {memo, useCallback, useEffect, useState} from 'react';
import {View, StyleSheet, Text, Linking} from 'react-native';
import NavigationServices from 'services/NavigationServices';
import ScreenID from 'common/ScreenID';
import useThemeColor from 'hook/useThemeColor';
import GlobalVariable from 'services/GlobalVariable';
import AppStyles from 'common/AppStyles';
import {buidlerHomeURL} from 'helpers/LinkHelper';
import {removeCredentials} from 'services/keychain';
import web3auth, {web3authRedirectUrl} from 'services/connectors/web3auth';
import {LOGIN_PROVIDER} from '@web3auth/react-native-sdk';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AsyncKey} from 'common/AppStorage';
import {useWalletConnect} from '@walletconnect/react-native-dapp';
import api from 'services/api';
import {ethers, utils} from 'ethers';
import ModalBottom from 'components/ModalBottom';
import WalletConnectSignMessage from 'components/WalletConnectSignMessage';
import useAppDispatch from 'hook/useAppDispatch';
import {accessAppWithWalletConnect} from 'actions/UserActions';
import {Toast} from 'react-native-toast-message/lib/src/Toast';
import MenuLoginSeed from 'components/MenuLoginSeed';
import MenuLoginSocial from 'components/MenuLoginSocial';
import MixpanelAnalytics from 'services/analytics/MixpanelAnalytics';

const LoginScreen = () => {
  const dispatch = useAppDispatch();
  const connector = useWalletConnect();
  const [connectData, setConnectData] = useState({
    address: '',
    signMessage: '',
  });
  const [openSignMessage, setOpenSignMessage] = useState(false);
  const [openLoginSeed, setOpenLoginSeed] = useState(false);
  const [openLoginSocial, setOpenLoginSocial] = useState(false);
  const onCloseSignMessage = useCallback(() => {
    setOpenSignMessage(false);
  }, []);
  const handleCancel = useCallback(() => {
    connector.killSession();
    onCloseSignMessage();
  }, [connector, onCloseSignMessage]);
  const onSignMessage = useCallback(async () => {
    try {
      const params = [
        utils.hexlify(ethers.utils.toUtf8Bytes(connectData.signMessage)),
        connectData.address,
      ];
      const signature = await connector.signPersonalMessage(params);
      dispatch(accessAppWithWalletConnect(connectData.signMessage, signature));
    } catch (e) {
      Toast.show({
        type: 'customError',
        props: {message: e.message},
      });
    }
    setOpenSignMessage(false);
  }, [connectData.address, connectData.signMessage, connector, dispatch]);
  const {colors} = useThemeColor();
  useEffect(() => {
    connector?.killSession?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const onCreatePress = useCallback(() => {
    MixpanelAnalytics.tracking('Login Method Selected', {
      category: 'Login',
      method: 'Create',
    });
    GlobalVariable.sessionExpired = false;
    AsyncStorage.setItem(AsyncKey.isBackup, 'false');
    toggleLoginSeed();
    NavigationServices.pushToScreen(ScreenID.CreatePasswordScreen);
  }, [toggleLoginSeed]);
  const onImportPress = useCallback(() => {
    MixpanelAnalytics.tracking('Login Method Selected', {
      category: 'Login',
      method: 'Import',
    });
    GlobalVariable.sessionExpired = false;
    AsyncStorage.setItem(AsyncKey.isBackup, 'true');
    toggleLoginSeed();
    NavigationServices.pushToScreen(ScreenID.ImportSeedPhraseScreen);
  }, [toggleLoginSeed]);

  const onWCPress = useCallback(async () => {
    let address = '';
    MixpanelAnalytics.tracking('Login Method Selected', {
      category: 'Login',
      method: 'WalletConnect',
    });
    if (!connector.connected) {
      const res = await connector.connect();
      address = res.accounts?.[0];
    } else {
      address = connector.accounts?.[0];
    }
    const nonceRes = await api.requestNonceWithAddress(address);
    if (nonceRes.success) {
      setConnectData({address, signMessage: nonceRes.data.message});
      setOpenSignMessage(true);
    }
  }, [connector]);
  const onSocialConnectPress = useCallback(async (provider: string) => {
    MixpanelAnalytics.tracking('Login Method Selected', {
      category: 'Login',
      method: provider,
    });
    GlobalVariable.sessionExpired = false;
    AsyncStorage.setItem(AsyncKey.isBackup, 'false');
    const res = await web3auth.login({
      redirectUrl: web3authRedirectUrl,
      loginProvider: provider,
    });
    if (res.privKey) {
      NavigationServices.pushToScreen(ScreenID.CreatePasswordScreen, {
        seed: res.privKey,
        method: provider,
      });
    }
  }, []);
  const toggleLoginSeed = useCallback(
    () => setOpenLoginSeed(current => !current),
    [],
  );
  const toggleLoginSocial = useCallback(
    () => setOpenLoginSocial(current => !current),
    [],
  );
  const onLoginWithApple = useCallback(() => {
    onSocialConnectPress(LOGIN_PROVIDER.APPLE);
  }, [onSocialConnectPress]);
  const onLoginWithDiscord = useCallback(() => {
    onSocialConnectPress(LOGIN_PROVIDER.DISCORD);
  }, [onSocialConnectPress]);
  const onLoginWithFacebook = useCallback(() => {
    onSocialConnectPress(LOGIN_PROVIDER.FACEBOOK);
  }, [onSocialConnectPress]);
  const onLoginWithGoogle = useCallback(() => {
    onSocialConnectPress(LOGIN_PROVIDER.GOOGLE);
  }, [onSocialConnectPress]);
  const onLoginWithTwitter = useCallback(() => {
    onSocialConnectPress(LOGIN_PROVIDER.TWITTER);
  }, [onSocialConnectPress]);
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
      <View style={{flex: 1}}>
        <Text style={[styles.title, {color: colors.text}]}>
          Release the on-chain superpower to buidl a trustless community
        </Text>
        <Text style={[styles.description, {color: colors.subtext}]}>
          The web3 messaging platform offers wallet-to-wallet messaging,
          token-based membership, and on-chain verification.
        </Text>
        <Touchable
          useReactNative
          style={[
            styles.createButton,
            {backgroundColor: colors.border, marginTop: 70},
          ]}
          onPress={toggleLoginSeed}>
          <Text style={[styles.text, {color: colors.text}]}>Seed Phrase</Text>
          <View style={styles.plusWrap}>
            <SVG.IconPlus width={16} height={16} fill={colors.text} />
          </View>
        </Touchable>
        <Touchable
          style={[
            styles.createButton,
            {backgroundColor: colors.border, marginTop: 15},
          ]}
          onPress={toggleLoginSocial}
          useReactNative>
          <Text style={[styles.text, {color: colors.text}]}>
            Social Connect
          </Text>
        </Touchable>
        <Touchable
          style={[
            styles.createButton,
            {backgroundColor: colors.border, marginTop: 15},
          ]}
          onPress={onWCPress}
          useReactNative>
          <Text style={[styles.text, {color: colors.text}]}>
            Wallet connect
          </Text>
          <SVG.IconWC />
        </Touchable>
      </View>
      <Text
        style={[
          AppStyles.TextMed13,
          {color: colors.subtext, marginBottom: AppDimension.extraBottom + 10},
        ]}>
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
      <ModalBottom
        isVisible={openSignMessage}
        onSwipeComplete={onCloseSignMessage}
        onBackdropPress={onCloseSignMessage}>
        <WalletConnectSignMessage
          message={connectData.signMessage}
          onCancelAction={handleCancel}
          onConfirmAction={onSignMessage}
        />
      </ModalBottom>
      <ModalBottom
        isVisible={openLoginSeed}
        onSwipeComplete={toggleLoginSeed}
        onBackdropPress={toggleLoginSeed}>
        <MenuLoginSeed
          onCreatePress={onCreatePress}
          onImportPress={onImportPress}
        />
      </ModalBottom>
      <ModalBottom
        isVisible={openLoginSocial}
        onSwipeComplete={toggleLoginSocial}
        onBackdropPress={toggleLoginSocial}>
        <MenuLoginSocial
          onLoginApple={onLoginWithApple}
          onLoginDiscord={onLoginWithDiscord}
          onLoginFacebook={onLoginWithFacebook}
          onLoginGoogle={onLoginWithGoogle}
          onLoginTwitter={onLoginWithTwitter}
        />
      </ModalBottom>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: AppDimension.extraTop + 70,
    justifyContent: 'center',
    flex: 1,
    paddingHorizontal: 30,
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
    fontSize: 28,
    lineHeight: 35,
    fontFamily: Fonts.Bold,
    marginTop: 30,
  },
  description: {
    fontSize: 16,
    lineHeight: 26,
    fontFamily: Fonts.SemiBold,
    marginTop: 30,
  },
  createButton: {
    borderRadius: 5,
    height: 60,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingLeft: 20,
    paddingRight: 15,
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
