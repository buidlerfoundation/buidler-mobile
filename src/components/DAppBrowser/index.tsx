import {utils} from 'ethers';
import useAppSelector from 'hook/useAppSelector';
import useUserAddress from 'hook/useUserAddress';
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {Platform} from 'react-native';
import RNFS from 'react-native-fs';
import WebView from 'react-native-webview';

type DAppBrowserProps = {
  url?: string;
};

const DAppBrowser = ({url}: DAppBrowserProps) => {
  const privateKey = useAppSelector(state => state.configs.privateKey);
  const webviewRef = useRef<WebView>();
  const address = useUserAddress();
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
  if (!scriptInject || !url) return null;
  return (
    <WebView
      ref={webviewRef}
      source={{uri: url}}
      injectedJavaScriptBeforeContentLoaded={scriptInject}
      onMessage={onMessage}
      originWhitelist={['*']}
    />
  );
};

export default memo(DAppBrowser);
