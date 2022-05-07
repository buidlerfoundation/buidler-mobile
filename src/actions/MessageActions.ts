import {
  normalizeMessageData,
  normalizePublicMessageData,
} from 'helpers/ChannelHelper';
import {ActionCreator, Dispatch} from 'redux';
import api from 'services/api';
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
  async (dispatch: Dispatch) => {
    if (before) {
      dispatch({type: actionTypes.MESSAGE_MORE, payload: {channelId}});
    } else if (isFresh) {
      dispatch({type: actionTypes.MESSAGE_FRESH, payload: {channelId}});
    } else {
      dispatch({type: actionTypes.MESSAGE_REQUEST, payload: {channelId}});
    }
    const messageRes = await api.getMessages(channelId, 20, before);
    const isPrivate = channelType === 'Private' || channelType === 'Direct';
    if (messageRes.statusCode === 200) {
      const messageData = isPrivate
        ? await normalizeMessageData(messageRes.data, channelId)
        : await normalizePublicMessageData(messageRes.data);
      dispatch({
        type: actionTypes.MESSAGE_SUCCESS,
        payload: {data: messageData, channelId, before, isFresh},
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
