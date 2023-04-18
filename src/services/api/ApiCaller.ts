import {BaseDataApi} from 'models';
import store from 'store';
import AppConfig, {
  ignoreMessageErrorApis,
  whiteListRefreshTokenApis,
} from 'common/AppConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AsyncKey} from 'common/AppStorage';
import GlobalVariable from 'services/GlobalVariable';
import Toast from 'react-native-toast-message';
import {logout, refreshToken} from 'actions/UserActions';
import NavigationServices from 'services/NavigationServices';
import ScreenID, {StackID} from 'common/ScreenID';
import SocketUtils from 'utils/SocketUtils';
import MixpanelAnalytics from 'services/analytics/MixpanelAnalytics';
import {API_URL} from 'react-native-dotenv';

const METHOD_GET = 'get';
const METHOD_POST = 'post';
const METHOD_PUT = 'put';
const METHOD_DELETE = 'delete';
const METHOD_PATCH = 'patch';

const sleep = (timeout = 1000) => {
  return new Promise(resolve => {
    setTimeout(resolve, timeout);
  });
};

const handleError = (message: string, apiData: any, withoutError?: boolean) => {
  const {uri, fetchOptions} = apiData;
  const compareUri = `${fetchOptions.method}-${uri}`;
  if (!ignoreMessageErrorApis.includes(compareUri) && !withoutError) {
    Toast.show({
      type: 'customError',
      props: {message},
    });
  }
};

const getRequestBody = (data: any) => {
  try {
    const body = JSON.parse(data);
    return body;
  } catch (error) {
    return {};
  }
};

const logger = (...arg) => {
  if (__DEV__) {
    console.log(...arg);
  }
};

const fetchWithRetry = (
  uri: string,
  fetchOptions: any = {},
  retries = 0,
  serviceBaseUrl?: string,
  withoutError?: boolean,
) => {
  let apiUrl = '';
  if (serviceBaseUrl) {
    apiUrl = serviceBaseUrl + uri;
  } else {
    apiUrl = AppConfig.baseUrl + uri;
  }
  const reqTime = new Date().getTime();
  logger('Request: ', {
    apiUrl,
    reqTime,
    fetchOptions,
  });
  return fetch(apiUrl, fetchOptions)
    .then(res => {
      return res
        .json()
        .then(async data => {
          const resTime = new Date().getTime();
          logger('Response: ', {
            apiUrl,
            data,
            resTime,
            time: resTime - reqTime,
          });
          if (res.status !== 200) {
            // alert error
            if (data.message === 'Network request failed') {
              if (retries > 0) {
                await sleep();
                return fetchWithRetry(
                  uri,
                  fetchOptions,
                  retries - 1,
                  serviceBaseUrl,
                  withoutError,
                );
              } else {
                NavigationServices.reset(ScreenID.SplashScreen);
              }
            } else {
              handleError(
                data.message || data,
                {uri, fetchOptions},
                withoutError,
              );
            }
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
      MixpanelAnalytics.trackingError(
        apiUrl.replace(API_URL, ''),
        fetchOptions.method.toLowerCase(),
        err.message || '',
        err.statusCode,
        getRequestBody(fetchOptions.body),
      );
      const msg = err.message || err;
      if (!msg.includes('aborted')) {
        // alert error
      }
      return {
        message: msg,
      };
    });
};

async function requestAPI<T = any>(
  method: string,
  uri: string,
  body?: any,
  serviceBaseUrl?: string,
  controller?: AbortController,
  h?: any,
  withoutError?: boolean,
): Promise<BaseDataApi<T>> {
  if (GlobalVariable.sessionExpired) {
    return {
      success: false,
      statusCode: 403,
      message: 'Refresh token failed',
    };
  }
  if (!whiteListRefreshTokenApis.includes(`${method}-${uri}`)) {
    const expireTokenTime = await AsyncStorage.getItem(AsyncKey.tokenExpire);
    if (!expireTokenTime || new Date().getTime() / 1000 > expireTokenTime) {
      const res: any = await store.dispatch(refreshToken());
      if (!res.success) {
        if (res.message === 'Failed to authenticate refresh token') {
          if (!GlobalVariable.sessionExpired) {
            GlobalVariable.sessionExpired = true;
            Toast.show({
              type: 'customError',
              props: {message: 'Session expired'},
            });
            await store.dispatch(logout());
            NavigationServices.reset(StackID.AuthStack);
          }
        } else {
          Toast.show({
            type: 'customError',
            props: {message: res.message},
          });
        }
        return {
          success: false,
          statusCode: 403,
          message: 'Refresh token failed',
        };
      }
      SocketUtils.init();
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
  return fetchWithRetry(
    uri,
    fetchOptions,
    uri === 'user/refresh' ? 5 : 0,
    serviceBaseUrl,
    withoutError,
  );
}

const ApiCaller = {
  get<T>(
    url: string,
    baseUrl?: string,
    controller?: AbortController,
    h?: any,
    withoutError?: boolean,
  ) {
    return requestAPI<T>(
      METHOD_GET,
      url,
      undefined,
      baseUrl,
      controller,
      h,
      withoutError,
    );
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
