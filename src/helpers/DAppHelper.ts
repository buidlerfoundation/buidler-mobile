export const injectedJSProviders = (url: string, address: string) => {
  let providerConfigs = 'window.ethereum.isMetaMask = true;';
  const debugScript = '';
  // const debugScript = `
  //   // Debug
  //   console = new Object();
  //   console.log = function(log) {
  //     window.ReactNativeWebView.postMessage(JSON.stringify(log));
  //   };
  //   console.debug = console.log;
  //   console.info = console.log;
  //   console.warn = console.log;
  //   console.error = console.log;
  // `;
  if (url === 'https://scroll.io/alpha/bridge') {
    providerConfigs = `
      window.ethereum.isMetaMask = true;
      window.ethereum.isTrust = false;
    `;
  }
  return `(function() {
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
    ${providerConfigs}
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
    ${debugScript}
  })();`;
};
