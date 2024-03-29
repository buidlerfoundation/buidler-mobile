const _REQUEST = '_REQUEST';
const _SUCCESS = '_SUCCESS';
const _FAIL = '_FAIL';
const _MORE = '_MORE';
const _FRESH = '_FRESH';
const LOGIN_PREFIX = 'LOGIN';
const ACCESS_APP_PREFIX = 'ACCESS_APP';
const USER_PREFIX = 'USER';
const TEAM_PREFIX = 'TEAM';
const CREATE_TEAM_PREFIX = 'CREATE_TEAM';
const CREATE_GROUP_CHANNEL_PREFIX = 'CREATE_GROUP_CHANNEL';
const UPDATE_GROUP_CHANNEL_PREFIX = 'UPDATE_GROUP_CHANNEL';
const DELETE_GROUP_CHANNEL_PREFIX = 'DELETE_GROUP_CHANNEL';
const UPDATE_SPACE_AVATAR_PREFIX = 'UPDATE_SPACE_AVATAR';
const CHANNEL_PREFIX = 'CHANNEL';
const CREATE_CHANNEL_PREFIX = 'CREATE_CHANNEL';
const UPDATE_CHANNEL_PREFIX = 'UPDATE_CHANNEL';
const DELETE_CHANNEL_PREFIX = 'DELETE_CHANNEL';
const UPDATE_CHANNEL_AVATAR_PREFIX = 'UPDATE_CHANNEL_AVATAR';
const TASK_PREFIX = 'TASK';
const TASK_USER_PREFIX = 'TASK_USER';
const ARCHIVED_TASK_PREFIX = 'ARCHIVED_TASK';
const UPDATE_TASK_PREFIX = 'UPDATE_TASK';
const CREATE_TASK_PREFIX = 'CREATE_TASK';
const DELETE_TASK_PREFIX = 'DELETE_TASK';
const ADD_REACT = 'ADD_REACT';
const REMOVE_REACT = 'REMOVE_REACT';
const MESSAGE_PREFIX = 'MESSAGE';
const TRANSACTION_PREFIX = 'TRANSACTION';
const CONVERSATION_PREFIX = 'CONVERSATION';
const ACTIVITY_PREFIX = 'ACTIVITY';
const REMOVE_MEMBER_PREFIX = 'REMOVE_MEMBER';
const LEAVE_TEAM_PREFIX = 'LEAVE_TEAM';
const USER_CHANNEL_PREFIX = 'USER_CHANNEL';
const UPDATE_TEAM_PREFIX = 'UPDATE_TEAM';
const DELETE_TEAM_PREFIX = 'DELETE_TEAM';
const UPDATE_USER_PREFIX = 'UPDATE_USER';
const SPACE_MEMBER_PREFIX = 'SPACE_MEMBER';
const WALLET_BALANCE_PREFIX = 'WALLET_BALANCE';
const MEMBER_DATA_PREFIX = 'MEMBER_DATA';
const CURRENT_TEAM_PREFIX = 'CURRENT_TEAM';
const COLLECTIBLE_PREFIX = 'COLLECTIBLE';
const PP_DETAIL_PREFIX = 'PP_DETAIL';
const MESSAGE_PP_PREFIX = 'MESSAGE_PP';
const REFRESH_TOKEN_PREFIX = 'REFRESH_TOKEN';

export const actionTypes = {
  SET_THEME: 'SET_THEME',
  SET_REAL_HEIGHT: 'SET_REAL_HEIGHT',
  LOGOUT: 'LOGOUT',
  SET_PRIVATE_KEY: 'SET_PRIVATE_KEY',
  REMOVE_PRIVATE_KEY: 'REMOVE_PRIVATE_KEY',
  SET_CHANNEL_PRIVATE_KEY: 'SET_CHANNEL_PRIVATE_KEY',
  SET_SEED_PHRASE: 'SET_SEED_PHRASE',
  REMOVE_SEED_PHRASE: 'REMOVE_SEED_PHRASE',
  LOGIN_PREFIX,
  LOGIN_REQUEST: LOGIN_PREFIX + _REQUEST,
  LOGIN_SUCCESS: LOGIN_PREFIX + _SUCCESS,
  LOGIN_FAIL: LOGIN_PREFIX + _FAIL,
  REFRESH_TOKEN_PREFIX,
  REFRESH_TOKEN_REQUEST: REFRESH_TOKEN_PREFIX + _REQUEST,
  REFRESH_TOKEN_SUCCESS: REFRESH_TOKEN_PREFIX + _SUCCESS,
  REFRESH_TOKEN_FAIL: REFRESH_TOKEN_PREFIX + _FAIL,
  USER_PREFIX,
  USER_REQUEST: USER_PREFIX + _REQUEST,
  USER_SUCCESS: USER_PREFIX + _SUCCESS,
  USER_FAIL: USER_PREFIX + _FAIL,
  TEAM_PREFIX,
  TEAM_REQUEST: TEAM_PREFIX + _REQUEST,
  TEAM_SUCCESS: TEAM_PREFIX + _SUCCESS,
  TEAM_FAIL: TEAM_PREFIX + _FAIL,
  CHANNEL_PREFIX,
  CHANNEL_REQUEST: CHANNEL_PREFIX + _REQUEST,
  CHANNEL_SUCCESS: CHANNEL_PREFIX + _SUCCESS,
  CHANNEL_FAIL: CHANNEL_PREFIX + _FAIL,
  GROUP_CHANNEL: 'GROUP_CHANNEL',
  UPDATE_GROUP_CHANNEL: 'UPDATE_GROUP_CHANNEL',
  SET_CURRENT_CHANNEL: 'SET_CURRENT_CHANNEL',
  SET_CURRENT_TEAM: 'SET_CURRENT_TEAM',
  GET_TEAM_ACTIVITY: 'GET_TEAM_ACTIVITY',
  MARK_SEEN_CHANNEL: 'MARK_SEEN_CHANNEL',
  MARK_UN_SEEN_CHANNEL: 'MARK_UN_SEEN_CHANNEL',
  USER_ONLINE: 'USER_ONLINE',
  USER_OFFLINE: 'USER_OFFLINE',
  CREATE_CHANNEL_PREFIX,
  CREATE_CHANNEL_REQUEST: CREATE_CHANNEL_PREFIX + _REQUEST,
  CREATE_CHANNEL_SUCCESS: CREATE_CHANNEL_PREFIX + _SUCCESS,
  CREATE_CHANNEL_FAIL: CREATE_CHANNEL_PREFIX + _FAIL,
  UPDATE_CHANNEL_PREFIX,
  UPDATE_CHANNEL_REQUEST: UPDATE_CHANNEL_PREFIX + _REQUEST,
  UPDATE_CHANNEL_SUCCESS: UPDATE_CHANNEL_PREFIX + _SUCCESS,
  UPDATE_CHANNEL_FAIL: UPDATE_CHANNEL_PREFIX + _FAIL,
  DELETE_CHANNEL_PREFIX,
  DELETE_CHANNEL_REQUEST: DELETE_CHANNEL_PREFIX + _REQUEST,
  DELETE_CHANNEL_SUCCESS: DELETE_CHANNEL_PREFIX + _SUCCESS,
  DELETE_CHANNEL_FAIL: DELETE_CHANNEL_PREFIX + _FAIL,
  GET_INITIAL: 'GET_INITIAL',
  TASK_PREFIX,
  TASK_REQUEST: TASK_PREFIX + _REQUEST,
  TASK_MORE: TASK_PREFIX + _MORE,
  TASK_SUCCESS: TASK_PREFIX + _SUCCESS,
  TASK_FAIL: TASK_PREFIX + _FAIL,
  PP_DETAIL_PREFIX,
  PP_DETAIL_REQUEST: PP_DETAIL_PREFIX + _REQUEST,
  PP_DETAIL_SUCCESS: PP_DETAIL_PREFIX + _SUCCESS,
  PP_DETAIL_FAIL: PP_DETAIL_PREFIX + _FAIL,
  TASK_USER_PREFIX,
  TASK_USER_REQUEST: TASK_USER_PREFIX + _REQUEST,
  TASK_USER_SUCCESS: TASK_USER_PREFIX + _SUCCESS,
  TASK_USER_FAIL: TASK_USER_PREFIX + _FAIL,
  CREATE_TASK_PREFIX,
  CREATE_TASK_REQUEST: CREATE_TASK_PREFIX + _REQUEST,
  CREATE_TASK_SUCCESS: CREATE_TASK_PREFIX + _SUCCESS,
  CREATE_TASK_FAIL: CREATE_TASK_PREFIX + _FAIL,
  DELETE_TASK_PREFIX,
  DELETE_TASK_REQUEST: DELETE_TASK_PREFIX + _REQUEST,
  DELETE_TASK_SUCCESS: DELETE_TASK_PREFIX + _SUCCESS,
  DELETE_TASK_FAIL: DELETE_TASK_PREFIX + _FAIL,
  UPDATE_TASK_PREFIX,
  UPDATE_TASK_REQUEST: UPDATE_TASK_PREFIX + _REQUEST,
  UPDATE_TASK_SUCCESS: UPDATE_TASK_PREFIX + _SUCCESS,
  UPDATE_TASK_FAIL: UPDATE_TASK_PREFIX + _FAIL,
  DROP_TASK: 'DROP_TASK',
  ARCHIVED_TASK_PREFIX,
  ARCHIVED_TASK_REQUEST: ARCHIVED_TASK_PREFIX + _REQUEST,
  ARCHIVED_TASK_SUCCESS: ARCHIVED_TASK_PREFIX + _SUCCESS,
  ARCHIVED_TASK_FAIL: ARCHIVED_TASK_PREFIX + _FAIL,
  ADD_REACT,
  REMOVE_REACT,
  GET_TEAM_USER: 'GET_TEAM_USER',
  TRANSACTION_PREFIX,
  TRANSACTION_REQUEST: TRANSACTION_PREFIX + _REQUEST,
  TRANSACTION_SUCCESS: TRANSACTION_PREFIX + _SUCCESS,
  TRANSACTION_FAIL: TRANSACTION_PREFIX + _FAIL,
  TRANSACTION_MORE: TRANSACTION_PREFIX + _MORE,
  TRANSACTION_FRESH: TRANSACTION_PREFIX + _FRESH,
  MESSAGE_PREFIX,
  MESSAGE_REQUEST: MESSAGE_PREFIX + _REQUEST,
  MESSAGE_SUCCESS: MESSAGE_PREFIX + _SUCCESS,
  MESSAGE_FAIL: MESSAGE_PREFIX + _FAIL,
  MESSAGE_MORE: MESSAGE_PREFIX + _MORE,
  MESSAGE_FRESH: MESSAGE_PREFIX + _FRESH,
  MESSAGE_PP_PREFIX,
  MESSAGE_PP_REQUEST: MESSAGE_PP_PREFIX + _REQUEST,
  MESSAGE_PP_SUCCESS: MESSAGE_PP_PREFIX + _SUCCESS,
  MESSAGE_PP_FAIL: MESSAGE_PP_PREFIX + _FAIL,
  MESSAGE_PP_MORE: MESSAGE_PP_PREFIX + _MORE,
  MESSAGE_PP_FRESH: MESSAGE_PP_PREFIX + _FRESH,
  EDIT_MESSAGE: 'EDIT_MESSAGE',
  DELETE_MESSAGE: 'DELETE_MESSAGE',
  REMOVE_MESSAGE_ATTACHMENT: 'REMOVE_MESSAGE_ATTACHMENT',
  CONVERSATION_PREFIX,
  CONVERSATION_REQUEST: CONVERSATION_PREFIX + _REQUEST,
  CONVERSATION_SUCCESS: CONVERSATION_PREFIX + _SUCCESS,
  CONVERSATION_FAIL: CONVERSATION_PREFIX + _FAIL,
  CONVERSATION_MORE: CONVERSATION_PREFIX + _MORE,
  CONVERSATION_FRESH: CONVERSATION_PREFIX + _FRESH,
  RECEIVE_MESSAGE: 'RECEIVE_MESSAGE',
  SET_CHANNEL_SCROLL_DATA: 'SET_CHANNEL_SCROLL_DATA',
  ACTIVITY_PREFIX,
  ACTIVITY_REQUEST: ACTIVITY_PREFIX + _REQUEST,
  ACTIVITY_SUCCESS: ACTIVITY_PREFIX + _SUCCESS,
  ACTIVITY_FAIL: ACTIVITY_PREFIX + _FAIL,
  CREATE_GROUP_CHANNEL_PREFIX,
  CREATE_GROUP_CHANNEL_REQUEST: CREATE_GROUP_CHANNEL_PREFIX + _REQUEST,
  CREATE_GROUP_CHANNEL_SUCCESS: CREATE_GROUP_CHANNEL_PREFIX + _SUCCESS,
  CREATE_GROUP_CHANNEL_FAIL: CREATE_GROUP_CHANNEL_PREFIX + _FAIL,
  UPDATE_GROUP_CHANNEL_PREFIX,
  UPDATE_GROUP_CHANNEL_REQUEST: UPDATE_GROUP_CHANNEL_PREFIX + _REQUEST,
  UPDATE_GROUP_CHANNEL_SUCCESS: UPDATE_GROUP_CHANNEL_PREFIX + _SUCCESS,
  UPDATE_GROUP_CHANNEL_FAIL: UPDATE_GROUP_CHANNEL_PREFIX + _FAIL,
  UPDATE_SPACE_AVATAR_PREFIX,
  UPDATE_SPACE_AVATAR_REQUEST: UPDATE_SPACE_AVATAR_PREFIX + _REQUEST,
  UPDATE_SPACE_AVATAR_SUCCESS: UPDATE_SPACE_AVATAR_PREFIX + _SUCCESS,
  UPDATE_SPACE_AVATAR_FAIL: UPDATE_SPACE_AVATAR_PREFIX + _FAIL,
  UPDATE_CHANNEL_AVATAR_PREFIX,
  UPDATE_CHANNEL_AVATAR_REQUEST: UPDATE_CHANNEL_AVATAR_PREFIX + _REQUEST,
  UPDATE_CHANNEL_AVATAR_SUCCESS: UPDATE_CHANNEL_AVATAR_PREFIX + _SUCCESS,
  UPDATE_CHANNEL_AVATAR_FAIL: UPDATE_CHANNEL_AVATAR_PREFIX + _FAIL,
  DELETE_GROUP_CHANNEL_PREFIX,
  DELETE_GROUP_CHANNEL_REQUEST: DELETE_GROUP_CHANNEL_PREFIX + _REQUEST,
  DELETE_GROUP_CHANNEL_SUCCESS: DELETE_GROUP_CHANNEL_PREFIX + _SUCCESS,
  DELETE_GROUP_CHANNEL_FAIL: DELETE_GROUP_CHANNEL_PREFIX + _FAIL,
  CREATE_TEAM_PREFIX,
  CREATE_TEAM_REQUEST: CREATE_TEAM_PREFIX + _REQUEST,
  CREATE_TEAM_SUCCESS: CREATE_TEAM_PREFIX + _SUCCESS,
  CREATE_TEAM_FAIL: CREATE_TEAM_PREFIX + _FAIL,
  REMOVE_MEMBER_PREFIX,
  REMOVE_MEMBER_REQUEST: REMOVE_MEMBER_PREFIX + _REQUEST,
  REMOVE_MEMBER_SUCCESS: REMOVE_MEMBER_PREFIX + _SUCCESS,
  REMOVE_MEMBER_FAIL: REMOVE_MEMBER_PREFIX + _FAIL,
  LEAVE_TEAM_PREFIX,
  LEAVE_TEAM_REQUEST: LEAVE_TEAM_PREFIX + _REQUEST,
  LEAVE_TEAM_SUCCESS: LEAVE_TEAM_PREFIX + _SUCCESS,
  LEAVE_TEAM_FAIL: LEAVE_TEAM_PREFIX + _FAIL,
  USER_CHANNEL_PREFIX,
  USER_CHANNEL_REQUEST: USER_CHANNEL_PREFIX + _REQUEST,
  USER_CHANNEL_SUCCESS: USER_CHANNEL_PREFIX + _SUCCESS,
  USER_CHANNEL_FAIL: USER_CHANNEL_PREFIX + _FAIL,
  UPDATE_TEAM_PREFIX,
  UPDATE_TEAM_REQUEST: UPDATE_TEAM_PREFIX + _REQUEST,
  UPDATE_TEAM_SUCCESS: UPDATE_TEAM_PREFIX + _SUCCESS,
  UPDATE_TEAM_FAIL: UPDATE_TEAM_PREFIX + _FAIL,
  DELETE_TEAM_PREFIX,
  DELETE_TEAM_REQUEST: DELETE_TEAM_PREFIX + _REQUEST,
  DELETE_TEAM_SUCCESS: DELETE_TEAM_PREFIX + _SUCCESS,
  DELETE_TEAM_FAIL: DELETE_TEAM_PREFIX + _FAIL,
  NEW_USER: 'NEW_USER',
  NEW_CHANNEL: 'NEW_CHANNEL',
  UPDATE_USER_PREFIX,
  UPDATE_USER_REQUEST: UPDATE_USER_PREFIX + _REQUEST,
  UPDATE_USER_SUCCESS: UPDATE_USER_PREFIX + _SUCCESS,
  UPDATE_USER_FAIL: UPDATE_USER_PREFIX + _FAIL,
  TOGGLE_OTP: 'TOGGLE_OTP',
  SET_DATA_FROM_URL: 'SET_DATA_FROM_URL',
  REMOVE_DATA_FROM_URL: 'REMOVE_DATA_FROM_URL',
  EMIT_NEW_MESSAGE: 'EMIT_NEW_MESSAGE',
  SPACE_MEMBER_PREFIX,
  SPACE_MEMBER_REQUEST: SPACE_MEMBER_PREFIX + _REQUEST,
  SPACE_MEMBER_SUCCESS: SPACE_MEMBER_PREFIX + _SUCCESS,
  SPACE_MEMBER_FAIL: SPACE_MEMBER_PREFIX + _FAIL,
  WALLET_CONNECT_CONNECTED: 'WALLET_CONNECT_CONNECTED',
  WALLET_CONNECT_DISCONNECTED: 'WALLET_CONNECT_DISCONNECTED',
  UPDATE_FULL_SCREEN: 'UPDATE_FULL_SCREEN',
  SWITCH_NETWORK: 'SWITCH_NETWORK',
  WALLET_BALANCE_PREFIX,
  WALLET_BALANCE_REQUEST: WALLET_BALANCE_PREFIX + _REQUEST,
  WALLET_BALANCE_SUCCESS: WALLET_BALANCE_PREFIX + _SUCCESS,
  WALLET_BALANCE_FAIL: WALLET_BALANCE_PREFIX + _FAIL,
  ADD_USER_TOKEN: 'ADD_USER_TOKEN',
  ADD_USER_TO_SPACE: 'ADD_USER_TO_SPACE',
  REMOVE_USER_FROM_SPACE: 'REMOVE_USER_FROM_SPACE',
  UPDATE_TRANSACTION_TOAST: 'UPDATE_TRANSACTION_TOAST',
  CLEAR_LAST_CHANNEL: 'CLEAR_LAST_CHANNEL',
  UPDATE_CURRENT_TOKEN: 'UPDATE_CURRENT_TOKEN',
  ACCEPT_TEAM_SUCCESS: 'ACCEPT_TEAM_SUCCESS',
  UPDATE_EXPAND_SPACE_ITEM: 'UPDATE_EXPAND_SPACE_ITEM',
  MEMBER_DATA_PREFIX,
  MEMBER_DATA_REQUEST: MEMBER_DATA_PREFIX + _REQUEST,
  MEMBER_DATA_SUCCESS: MEMBER_DATA_PREFIX + _SUCCESS,
  MEMBER_DATA_FAIL: MEMBER_DATA_PREFIX + _FAIL,
  MEMBER_DATA_MORE: MEMBER_DATA_PREFIX + _MORE,
  CURRENT_TEAM_PREFIX,
  CURRENT_TEAM_REQUEST: CURRENT_TEAM_PREFIX + _REQUEST,
  CURRENT_TEAM_SUCCESS: CURRENT_TEAM_PREFIX + _SUCCESS,
  CURRENT_TEAM_FAIL: CURRENT_TEAM_PREFIX + _FAIL,
  SET_METAMASK_ACCOUNT: 'SET_METAMASK_ACCOUNT',
  UPDATE_LAST_CHANNEL: 'UPDATE_LAST_CHANNEL',
  COLLECTIBLE_PREFIX,
  COLLECTIBLE_REQUEST: COLLECTIBLE_PREFIX + _REQUEST,
  COLLECTIBLE_SUCCESS: COLLECTIBLE_PREFIX + _SUCCESS,
  COLLECTIBLE_FAIL: COLLECTIBLE_PREFIX + _FAIL,
  ACCESS_APP_PREFIX,
  ACCESS_APP_REQUEST: ACCESS_APP_PREFIX + _REQUEST,
  ACCESS_APP_SUCCESS: ACCESS_APP_PREFIX + _SUCCESS,
  ACCESS_APP_FAIL: ACCESS_APP_PREFIX + _FAIL,
  UPDATE_HIGHLIGHT_MESSAGE: 'UPDATE_HIGHLIGHT_MESSAGE',
  GET_PHOTO_ALBUMS: 'GET_PHOTO_ALBUMS',
  GET_PHOTO_BY_ALBUM: 'GET_PHOTO_BY_ALBUM',
};
