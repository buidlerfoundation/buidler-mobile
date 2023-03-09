import {BaseDataApi} from 'models';
import store from 'store';
import {whiteListRefreshTokenApis} from 'common/AppConfig';
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

const fetchWithRetry = (apiUrl: string, fetchOptions = {}, retries = 0) => {
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
                return fetchWithRetry(apiUrl, fetchOptions, retries - 1);
              } else {
                NavigationServices.reset(ScreenID.SplashScreen);
              }
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
      const success = await store.dispatch(refreshToken());
      if (!success) {
        if (!GlobalVariable.sessionExpired) {
          GlobalVariable.sessionExpired = true;
          Toast.show({
            type: 'customError',
            props: {message: 'Session expired'},
          });
          await store.dispatch(logout());
          NavigationServices.reset(StackID.AuthStack);
        }
        return {
          success: false,
          statusCode: 403,
          message: 'Refresh token failed',
        };
      } else {
        SocketUtils.init();
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
    apiUrl = API_URL + uri;
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
  return fetchWithRetry(apiUrl, fetchOptions, uri === 'user/refresh' ? 5 : 0);
}

const ApiCaller = {
  get<T>(url: string, baseUrl?: string, controller?: AbortController, h?: any) {
    return requestAPI<T>(METHOD_GET, url, undefined, baseUrl, controller, h);
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
