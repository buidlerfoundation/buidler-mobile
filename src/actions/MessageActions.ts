import {
  normalizeMessageData,
  normalizePublicMessageData,
} from 'helpers/ChannelHelper';
import {ActionCreator, Dispatch} from 'redux';
import api from 'services/api';
import {AppGetState} from 'store';
import SocketUtils from 'utils/SocketUtils';
import {actionTypes} from './actionTypes';

export const getConversations: ActionCreator<any> =
  (parentId: string, before?: string, isFresh = false) =>
  async (dispatch: Dispatch) => {
    if (before) {
      dispatch({type: actionTypes.CONVERSATION_MORE, payload: {parentId}});
    } else if (isFresh) {
      dispatch({type: actionTypes.CONVERSATION_FRESH, payload: {parentId}});
    } else {
      dispatch({
        type: actionTypes.CONVERSATION_REQUEST,
        payload: {parentId},
      });
    }
    const messageRes = await api.getConversation(parentId, 20, before);
    if (messageRes.statusCode === 200) {
      dispatch({
        type: actionTypes.CONVERSATION_SUCCESS,
        payload: {data: messageRes.data, parentId, before, isFresh},
      });
    }
  };

export const getMessages: ActionCreator<any> =
  (channelId: string, channelType: string, before?: string, isFresh = false) =>
  async (dispatch: Dispatch, getState: AppGetState) => {
    const {apiController, messageData} = getState().message;
    apiController?.abort?.();
    if (!before) {
      const messages = messageData?.[channelId]?.data;
      SocketUtils.emitSeenChannel(messages?.[0]?.message_id, channelId);
    }
    const controller = new AbortController();
    if (before) {
      dispatch({type: actionTypes.MESSAGE_MORE, payload: {channelId}});
    } else if (isFresh) {
      dispatch({
        type: actionTypes.MESSAGE_FRESH,
        payload: {channelId, controller},
      });
    } else {
      dispatch({
        type: actionTypes.MESSAGE_REQUEST,
        payload: {channelId, controller},
      });
    }
    try {
      const messageRes = await api.getMessages(
        channelId,
        50,
        before,
        undefined,
        controller,
      );
      if (!before) {
        SocketUtils.emitSeenChannel(
          messageRes.data?.[0]?.message_id,
          channelId,
        );
      }
      const isPrivate = channelType === 'Private' || channelType === 'Direct';
      const messageData = isPrivate
        ? await normalizeMessageData(messageRes.data || [], channelId)
        : normalizePublicMessageData(messageRes.data || []);
      if (messageRes.statusCode === 200) {
        dispatch({
          type: actionTypes.MESSAGE_SUCCESS,
          payload: {
            data: messageData,
            channelId,
            before,
            isFresh,
            reloadSocket: !before,
          },
        });
      } else {
        dispatch({
          type: actionTypes.MESSAGE_FAIL,
          payload: messageRes,
        });
      }
    } catch (error) {
      dispatch({
        type: actionTypes.MESSAGE_FAIL,
        payload: {message: error},
      });
    }
  };

export const setScrollData: ActionCreator<any> =
  (channelId: string, data: any) => (dispatch: Dispatch) => {
    dispatch({
      type: actionTypes.SET_CHANNEL_SCROLL_DATA,
      payload: {channelId, data},
    });
  };
