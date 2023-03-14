import {useNavigation, useRoute} from '@react-navigation/native';
import AppDimension from 'common/AppDimension';
import AppStyles from 'common/AppStyles';
import SVG from 'common/SVG';
import Touchable from 'components/Touchable';
import {utils} from 'ethers';
import useAppSelector from 'hook/useAppSelector';
import useThemeColor from 'hook/useThemeColor';
import useUserAddress from 'hook/useUserAddress';
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {Platform, StyleSheet, Text, View} from 'react-native';
import RNFS from 'react-native-fs';
import WebView, {WebViewMessageEvent} from 'react-native-webview';

const DAppBrowserScreen = () => {
  const route = useRoute();
  const privateKey = useAppSelector(state => state.configs.privateKey);
  const webviewRef = useRef<WebView>();
  const navigation = useNavigation();
  const address = useUserAddress();
  const {colors} = useThemeColor();
  const onBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);
  const [jsContent, setJSContent] = useState<string | undefined>();
  useEffect(() => {
    const path =
      Platform.OS === 'ios'
        ? `${RNFS.MainBundlePath}/trust-min.js`
        : 'trust-min.js';
    RNFS.readFile(path, 'utf8').then(content => {
      setJSContent(content);
    });
  }, []);
  const scriptInject = useMemo(() => {
    if (!jsContent) return '';
    return `
      ${jsContent}
      (function() {
        var config = {                
            ethereum: {
                chainId: 1,
                rpcUrl: "https://cloudflare-eth.com",
                address: "${address}",
            },
            solana: {
                cluster: "mainnet-beta",
            },
            isDebug: true
        };
        trustwallet.ethereum = new trustwallet.Provider(config);
        trustwallet.solana = new trustwallet.SolanaProvider(config);
        trustwallet.postMessage = (json) => {
            window.ReactNativeWebView.postMessage(JSON.stringify(json));
        }
        window.ethereum = trustwallet.ethereum;
    })();
    (function () {
      var __mmHistory = window.history;
      var __mmPushState = __mmHistory.pushState;
      var __mmReplaceState = __mmHistory.replaceState;
      function __mm__updateUrl(){
        const siteName = document.querySelector('head > meta[property="og:site_name"]');
        const title = siteName || document.querySelector('head > meta[name="title"]') || document.title;
        const height = Math.max(document.documentElement.clientHeight, document.documentElement.scrollHeight, document.body.clientHeight, document.body.scrollHeight);
        window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify(
          {
            type: 'NAV_CHANGE',
            payload: {
              url: location.href,
              title: title,
            }
          }
        ));
        setTimeout(() => {
          const height = Math.max(document.documentElement.clientHeight, document.documentElement.scrollHeight, document.body.clientHeight, document.body.scrollHeight);
          window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify(
          {
            type: 'GET_HEIGHT',
            payload: {
              height: height
            }
          }))
        }, 500);
      }
      __mmHistory.pushState = function(state) {
        setTimeout(function () {
          __mm__updateUrl();
        }, 100);
        return __mmPushState.apply(history, arguments);
      };
      __mmHistory.replaceState = function(state) {
        setTimeout(function () {
          __mm__updateUrl();
        }, 100);
        return __mmReplaceState.apply(history, arguments);
      };
      window.onpopstate = function(event) {
        __mm__updateUrl();
      };
      })();
    `;
  }, [address, jsContent]);
  const onMessage = useCallback(
    async (evt: WebViewMessageEvent) => {
      const data = JSON.parse(evt.nativeEvent.data);
      const {id, name, network, object} = data;
      console.log(data, webviewRef.current);
      switch (name) {
        case 'requestAccounts':
          const setAddress = `window.${network}.setAddress("${address}")`;
          const callback = `window.${network}.sendResponse(${id}, ["${address}"])`;
          webviewRef.current.injectJavaScript(setAddress);
          webviewRef.current.injectJavaScript(callback);
          break;
        case 'signPersonalMessage':
          if (privateKey) {
            const message = utils.toUtf8String(object.data);
            const msgHash = utils.hashMessage(message);
            const msgHashBytes = utils.arrayify(msgHash);
            const signingKey = new utils.SigningKey(`0x${privateKey}`);
            const signature = signingKey.signDigest(msgHashBytes);
            const callback = `window.${network}.sendResponse(${id}, "${signature.compact}")`;
            webviewRef.current.injectJavaScript(callback);
          }
          break;
      }
    },
    [address, privateKey],
  );
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Touchable onPress={onBack}>
          <SVG.IconArrowBack fill={colors.text} />
        </Touchable>
        <Text
          style={[styles.title, AppStyles.TextBold17, {color: colors.text}]}>
          DApp Browser
        </Text>
      </View>
      {!!scriptInject && (
        <WebView
          ref={webviewRef}
          // source={{uri: 'https://app.uniswap.org/#/swap'}}
          // source={{uri: 'https://snapshot.org/#/'}}
          source={{uri: route.params?.url}}
          injectedJavaScriptBeforeContentLoaded={scriptInject}
          onMessage={onMessage}
          originWhitelist={['*']}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: AppDimension.extraTop,
  },
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
});

export default memo(DAppBrowserScreen);
