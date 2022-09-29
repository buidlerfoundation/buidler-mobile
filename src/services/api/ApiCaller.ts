import {BaseDataApi} from 'models';
import store from 'store';
import AppConfig, {whiteListRefreshTokenApis} from 'common/AppConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AsyncKey} from 'common/AppStorage';
import api from '.';
import GlobalVariable from 'services/GlobalVariable';
import Toast from 'react-native-toast-message';
import {logout} from 'actions/UserActions';
import NavigationServices from 'services/NavigationServices';
import {StackID} from 'common/ScreenID';

const METHOD_GET = 'get';
const METHOD_POST = 'post';
const METHOD_PUT = 'put';
const METHOD_DELETE = 'delete';
const METHOD_PATCH = 'patch';

const handleRefreshToken = async () => {
  const refreshTokenExpire = await AsyncStorage.getItem(
    AsyncKey.refreshTokenExpire,
  );
  const refreshToken = await AsyncStorage.getItem(AsyncKey.refreshTokenKey);
  if (
    !refreshTokenExpire ||
    !refreshToken ||
    new Date().getTime() / 1000 > refreshTokenExpire
  ) {
    return false;
  }
  const refreshTokenRes = await api.refreshToken(refreshToken);
  if (refreshTokenRes.success) {
    await AsyncStorage.setItem(
      AsyncKey.accessTokenKey,
      refreshTokenRes?.data?.token,
    );
    await AsyncStorage.setItem(
      AsyncKey.refreshTokenKey,
      refreshTokenRes?.data?.refresh_token,
    );
    await AsyncStorage.setItem(
      AsyncKey.tokenExpire,
      refreshTokenRes?.data?.token_expire_at?.toString(),
    );
    await AsyncStorage.setItem(
      AsyncKey.refreshTokenExpire,
      refreshTokenRes?.data?.refresh_token_expire_at?.toString(),
    );
  }
  return refreshTokenRes.success;
};

async function requestAPI<T = any>(
  method: string,
  uri: string,
  body?: any,
  serviceBaseUrl?: string,
  controller?: AbortController,
  h?: any,
): Promise<BaseDataApi<T>> {
  if (GlobalVariable.sessionExpired) {
    return {
      success: false,
      statusCode: 403,
    };
  }
  if (!whiteListRefreshTokenApis.includes(`${method}-${uri}`)) {
    const expireTokenTime = await AsyncStorage.getItem(AsyncKey.tokenExpire);
    if (!expireTokenTime || new Date().getTime() / 1000 > expireTokenTime) {
      const success = await handleRefreshToken();
      if (!success) {
        if (!GlobalVariable.sessionExpired) {
          GlobalVariable.sessionExpired = true;
          Toast.show({
            type: 'customError',
            props: {message: 'Session expired'},
          });
          await AsyncStorage.clear();
          store.dispatch(logout());
          NavigationServices.reset(StackID.AuthStack);
        }
        return {
          success: false,
          statusCode: 403,
        };
      }
    }
  }
  // Build API header
  let headers: any = {
    Accept: '*/*',
    'Access-Control-Allow-Origin': '*',
  };
  if (body instanceof FormData) {
    // headers['Content-Type'] = 'multipart/form-data';
    // headers = {};
  } else {
    headers['Content-Type'] = 'application/json';
  }

  // Build API url
  let apiUrl = '';
  if (serviceBaseUrl) {
    apiUrl = serviceBaseUrl + uri;
  } else {
    apiUrl = AppConfig.baseUrl + uri;
  }

  // Get access token and attach it to API request's header
  try {
    const accessToken = await AsyncStorage.getItem(AsyncKey.accessTokenKey);
    if (accessToken != null) {
      headers.Authorization = `Bearer ${accessToken}`;
    } else {
      console.log('No token is stored');
    }
  } catch (e: any) {
    console.log(e);
  }

  const chainId = store.getState().network.chainId;

  if (chainId) {
    headers['Chain-Id'] = chainId;
  }

  if (h) {
    headers = {
      ...headers,
      ...h,
    };
  }

  // Build API body
  let contentBody: any = null;
  if (
    method.toLowerCase() === METHOD_POST ||
    method.toLowerCase() === METHOD_PUT ||
    method.toLowerCase() === METHOD_DELETE ||
    method.toLowerCase() === METHOD_PATCH
  ) {
    if (body) {
      if (body instanceof FormData) {
        contentBody = body;
      } else {
        contentBody = JSON.stringify(body);
      }
    }
  }
  // Construct fetch options
  const fetchOptions: RequestInit = {method, headers, body: contentBody};
  if (controller) {
    fetchOptions.signal = controller.signal;
  }
  // Run the fetching
  return fetch(apiUrl, fetchOptions)
    .then(res => {
      return res
        .json()
        .then(data => {
          if (res.status !== 200) {
            // alert error
          }
          if (data.data) {
            return {...data, statusCode: res.status};
          }
          if (data.success || data.message) {
            return {
              data: data.data,
              success: data.success,
              message: data.message,
              statusCode: res.status,
            };
          }
          return {data, statusCode: res.status};
        })
        .catch(err => {
          return {message: err, statusCode: res.status};
        });
    })
    .catch(err => {
      const msg = err.message || err;
      if (!msg.includes('aborted')) {
        // alert error
      }
      return {
        message: msg,
      };
    });
}

const ApiCaller = {
  get<T>(url: string, baseUrl?: string, controller?: AbortController) {
    return requestAPI<T>(METHOD_GET, url, undefined, baseUrl, controller);
  },

  post<T>(
    url: string,
    data?: any,
    baseUrl?: string,
    controller?: AbortController,
    h?: any,
  ) {
    return requestAPI<T>(METHOD_POST, url, data, baseUrl, controller, h);
  },

  patch<T>(
    url: string,
    data?: any,
    baseUrl?: string,
    controller?: AbortController,
  ) {
    return requestAPI<T>(METHOD_PATCH, url, data, baseUrl, controller);
  },

  put<T>(
    url: string,
    data?: any,
    baseUrl?: string,
    controller?: AbortController,
  ) {
    return requestAPI<T>(METHOD_PUT, url, data, baseUrl, controller);
  },

  delete<T>(
    url: string,
    data?: any,
    baseUrl?: string,
    controller?: AbortController,
  ) {
    return requestAPI<T>(METHOD_DELETE, url, data, baseUrl, controller);
  },
};

export default ApiCaller;
