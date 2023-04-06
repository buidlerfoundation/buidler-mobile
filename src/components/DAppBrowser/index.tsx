import AppDimension from 'common/AppDimension';
import ModalBottom from 'components/ModalBottom';
import Spinner from 'components/Spinner';
import {ethers, providers, utils, Wallet} from 'ethers';
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
import {Platform, StyleSheet, View} from 'react-native';
import RNFS from 'react-native-fs';
import WebView from 'react-native-webview';
import LinkPreview from '@lowkey/react-native-link-preview';
import {Toast} from 'react-native-toast-message/lib/src/Toast';
import {INFURA_API_KEY} from 'react-native-dotenv';
import {DAppChain} from 'models';
import ConfirmView from './ConfirmView';

type DAppBrowserProps = {
  url?: string;
  focus?: boolean;
  webviewRef: React.MutableRefObject<WebView<{}>>;
};

const DAppBrowser = ({url, webviewRef, focus}: DAppBrowserProps) => {
  const [openModalConfirm, setOpenModalConfirm] = useState(false);
  const [currentChain, setCurrentChain] = useState<DAppChain | null>(null);
  const supportedChains = useAppSelector(state => state.user.dAppChains);
  const chainId = useAppSelector(state => state.network.chainId);
  const [gasPrice, setGasPrice] = useState(0);
  // const gasPrice = useAppSelector(state => state.network.gasPrice);
  const gasPriceHex = useMemo(
    () => ethers.BigNumber.from(`${gasPrice || 0}`).toHexString(),
    [gasPrice],
  );
  const [confirmData, setConfirmData] = useState<{
    title: string;
    message?: string;
    data: any;
  } | null>(null);
  const [dappMetadata, setDAppMetadata] = useState<{
    title: string;
    type: string;
    url: string;
    imageURL: string;
    description: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const {colors} = useThemeColor();
  const privateKey = useAppSelector(state => state.configs.privateKey);
  const address = useUserAddress();
  const [actionLoading, setActionLoading] = useState(false);
  const [jsContent, setJSContent] = useState<string | undefined>();
  const gasInterval = useRef<any>();
  const updateGasPrice = useCallback(async () => {
    let provider: providers.InfuraProvider | providers.JsonRpcProvider = null;
    if (currentChain) {
      provider = new providers.JsonRpcProvider(
        currentChain.rpc_url,
        currentChain.chain_id,
      );
    } else {
      provider = new providers.InfuraProvider(chainId, INFURA_API_KEY);
    }
    const res = await provider.getGasPrice();
    setGasPrice(res.toNumber());
  }, [chainId, currentChain]);
  const toggleModalConfirm = useCallback(
    () => setOpenModalConfirm(current => !current),
    [],
  );
  useEffect(() => {
    if (url) {
      LinkPreview.generate(url).then(res => setDAppMetadata(res));
      setCurrentChain(null);
    }
  }, [url]);
  useEffect(() => {
    const path =
      Platform.OS === 'ios'
        ? `${RNFS.MainBundlePath}/trust-min.js`
        : 'trust-min.js';
    RNFS.readFile(path, 'utf8').then(content => {
      setJSContent(content);
    });
  }, []);
  useEffect(() => {
    if (url) {
      setLoading(true);
    }
  }, [url]);
  const scriptInject = useMemo(() => {
    if (!jsContent) return '';
    // chainId: "5",
    // rpcUrl: "https://rpc.ankr.com/eth_goerli",
    // chainId: 1,
    // rpcUrl: "https://cloudflare-eth.com",
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
        window.ethereum.isMetaMask = true;
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
        // Debug
        // console = new Object();
        // console.log = function(log) {
        //   window.ReactNativeWebView.postMessage(JSON.stringify(log));
        // };
        // console.debug = console.log;
        // console.info = console.log;
        // console.warn = console.log;
        // console.error = console.log;
      })();
    `;
  }, [address, jsContent]);
  const getChain = useCallback(
    (chainId: number | string) => {
      return supportedChains.find(el => el.chain_id == chainId);
    },
    [supportedChains],
  );
  const onMessage = useCallback(
    async (evt: WebViewMessageEvent) => {
      const data = JSON.parse(evt.nativeEvent.data);
      const {name, object} = data;
      console.log(data, webviewRef.current);
      switch (name) {
        case 'requestAccounts':
          if (!data) {
            Toast.show({
              type: 'customError',
              props: {message: 'Missing data'},
            });
            break;
          }
          setConfirmData({
            title: 'Connect Wallet',
            data,
          });
          toggleModalConfirm();
          break;
        case 'signTransaction':
          if (!data) {
            Toast.show({
              type: 'customError',
              props: {message: 'Missing data'},
            });
            break;
          }
          await updateGasPrice();
          gasInterval.current = setInterval(updateGasPrice, 10000);
          setConfirmData({
            title: 'Sign Transaction',
            message: `from: ${object.from}\nto: ${object.to}\nvalue: ${object.value}`,
            data,
          });
          toggleModalConfirm();
          break;
        case 'signPersonalMessage':
          if (!data) {
            Toast.show({
              type: 'customError',
              props: {message: 'Missing data'},
            });
            break;
          }
          setConfirmData({
            title: 'Sign Ethereum Message',
            message: utils.toUtf8String(object.data),
            data,
          });
          toggleModalConfirm();
          break;
        case 'switchEthereumChain':
          if (!data) {
            Toast.show({
              type: 'customError',
              props: {message: 'Missing data'},
            });
            break;
          }
          const chain = getChain(object.chainId);
          if (!chain) {
            Toast.show({
              type: 'customError',
              props: {message: 'Unsupported chain'},
            });
            break;
          }
          setConfirmData({
            title: 'Switch Chain',
            message: `ChainId: ${object.chainId}`,
            data,
          });
          toggleModalConfirm();
          break;
      }
    },
    [focus, webviewRef, toggleModalConfirm, updateGasPrice, getChain],
  );
  const onWVLoadEnd = useCallback(() => {
    setTimeout(() => setLoading(false), 200);
  }, []);
  const onCancelAction = useCallback(() => {
    if (!confirmData?.data) return;
    if (gasInterval.current) {
      clearInterval(gasInterval.current);
    }
    const {network, id} = confirmData?.data;
    const callback = `window.${network}.sendError(${id}, "User cancel action")`;
    webviewRef.current.injectJavaScript(callback);
    toggleModalConfirm();
  }, [confirmData?.data, webviewRef, toggleModalConfirm]);
  const onConfirmAction = useCallback(async () => {
    if (!confirmData?.data) return;
    if (gasInterval.current) {
      clearInterval(gasInterval.current);
    }
    const {network, id, object} = confirmData?.data;
    switch (confirmData?.data.name) {
      case 'requestAccounts':
        const setAddress = `window.${network}.setAddress("${address}")`;
        const callbackRequestAccount = `window.${network}.sendResponse(${id}, ["${address}"])`;
        webviewRef.current.injectJavaScript(setAddress);
        webviewRef.current.injectJavaScript(callbackRequestAccount);
        break;
      case 'signTransaction':
        if (privateKey) {
          setActionLoading(true);
          let provider: providers.InfuraProvider | providers.JsonRpcProvider =
            null;
          if (currentChain) {
            provider = new providers.JsonRpcProvider(
              currentChain.rpc_url,
              currentChain.chain_id,
            );
          } else {
            provider = new providers.InfuraProvider(chainId, INFURA_API_KEY);
          }
          const signer = new Wallet(privateKey, provider);
          const transactionParameters = {
            gasLimit: object.gas,
            to: object.to,
            from: object.from,
            value: object.value,
            data: object.data,
            gasPrice: object.gasPrice || gasPriceHex,
          };
          try {
            const res = await signer.sendTransaction(transactionParameters);
            const callback = `window.${network}.sendResponse(${id}, "${res.hash}")`;
            webviewRef.current.injectJavaScript(callback);
          } catch (e) {
            const callback = `window.${network}.sendError(${id}, "Network error")`;
            webviewRef.current.injectJavaScript(callback);
            Toast.show({
              type: 'customError',
              props: {message: e.message},
            });
          }
          setActionLoading(false);
        }
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
      case 'switchEthereumChain':
        const chain = getChain(object.chainId);
        setCurrentChain(chain);
        const config = {
          ethereum: {
            address,
            chainId: parseInt(object.chainId),
            rpcUrl: chain.rpc_url,
          },
        };
        const configStr = JSON.stringify(config);
        const setConfig = `window.${network}.setConfig(${configStr})`;
        const emitChange = `window.${network}.emitChainChanged(${parseInt(
          object.chainId,
        )})`;
        const callback = `window.${network}.sendResponse(${id})`;
        webviewRef.current.injectJavaScript(setConfig);
        webviewRef.current.injectJavaScript(emitChange);
        webviewRef.current.injectJavaScript(callback);
        break;
    }
    toggleModalConfirm();
  }, [
    confirmData?.data,
    toggleModalConfirm,
    address,
    webviewRef,
    privateKey,
    getChain,
    currentChain,
    gasPriceHex,
    chainId,
  ]);
  if (!scriptInject || !url) return null;
  return (
    <>
      <WebView
        ref={webviewRef}
        source={{uri: url}}
        injectedJavaScriptBeforeContentLoaded={scriptInject}
        onMessage={onMessage}
        originWhitelist={['*']}
        allowsInlineMediaPlayback
        onLoadEnd={onWVLoadEnd}
      />
      {loading && (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: colors.background,
              top: AppDimension.headerHeight + AppDimension.extraTop,
            },
          ]}>
          <Spinner />
        </View>
      )}
      <ModalBottom
        isVisible={openModalConfirm && focus}
        onSwipeComplete={toggleModalConfirm}
        onBackdropPress={toggleModalConfirm}>
        <ConfirmView
          dappMetadata={dappMetadata}
          url={url}
          confirmData={confirmData}
          onCancelAction={onCancelAction}
          onConfirmAction={onConfirmAction}
          actionLoading={actionLoading}
          currentChain={currentChain}
          gasPrice={gasPrice}
        />
      </ModalBottom>
    </>
  );
};

export default memo(DAppBrowser);
