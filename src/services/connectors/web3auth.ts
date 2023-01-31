import Web3Auth, {OPENLOGIN_NETWORK} from '@web3auth/react-native-sdk';
import * as WebBrowser from '@toruslabs/react-native-web-browser';
import {WEB3_AUTH_CLIENT_ID} from 'react-native-dotenv';

export const web3authRedirectUrl = 'buidlerapp://openlogin';

const web3auth = new Web3Auth(WebBrowser, {
  clientId: WEB3_AUTH_CLIENT_ID,
  network: OPENLOGIN_NETWORK.MAINNET,
  redirectUrl: web3authRedirectUrl,
});

export default web3auth;
