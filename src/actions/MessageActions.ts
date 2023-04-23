import {
  getPrivateChannelKeys,
  normalizeMessageData,
  normalizePublicMessageData,
} from 'helpers/ChannelHelper';
import {ActionCreator, Dispatch} from 'redux';
import api from 'services/api';
import {AppGetState} from 'store';
import SocketUtils from 'utils/SocketUtils';
import {actionTypes} from './actionTypes';

export const getAroundMessage =
  (messageId: string, channelId: string, channelType: string) =>
  async (dispatch: Dispatch, getState: AppGetState) => {
    const {apiController} = getState().message;
    apiController?.abort?.();
    // eslint-disable-next-line no-undef
    const controller = new AbortController();
    dispatch({
      type: actionTypes.MESSAGE_REQUEST,
      payload: {messageId, channelId, controller},
    });
    const isPrivate = channelType === 'Private' || channelType === 'Direct';
    try {
      const messageRes = await api.getAroundMessageById(messageId);
      let messageData = [];
      if (isPrivate) {
        const privateChannelKeys = await getPrivateChannelKeys(
          getState().configs.privateKey,
          channelId,
        );
        dispatch({
          type: actionTypes.SET_CHANNEL_PRIVATE_KEY,
          payload: {
            ...getState().configs.channelPrivateKey,
            [channelId]: privateChannelKeys,
          },
        });
        messageData = await normalizeMessageData(
          messageRes.data || [],
          privateChannelKeys,
        );
      } else {
        messageData = normalizePublicMessageData(
          messageRes.data || [],
          messageRes.metadata?.encrypt_message_key,
        );
      }
      if (messageRes.statusCode === 200) {
        dispatch({
          type: actionTypes.MESSAGE_SUCCESS,
          payload: {
            data: messageData,
            channelId,
            messageId,
            canMoreAfter: messageRes.metadata?.can_loadmore_message_after,
            canMoreBefore: messageRes.metadata?.can_loadmore_message_before,
          },
        });
      } else {
        dispatch({
          type: actionTypes.MESSAGE_FAIL,
          payload: messageRes,
        });
      }
      return messageData;
    } catch (error) {
      dispatch({
        type: actionTypes.MESSAGE_FAIL,
        payload: {message: error},
      });
      return false;
    }
  };

export const deleteMessage: ActionCreator<any> =
  (messageId: string) => async () => {
    api.deleteMessage(messageId);
  };

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

export const onRemoveAttachment: ActionCreator<any> =
  (channelId: string, messageId: string, fileId: string) =>
  async (dispatch: Dispatch) => {
    dispatch({
      type: actionTypes.REMOVE_MESSAGE_ATTACHMENT,
      payload: {channelId, messageId, fileId},
    });
  };

export const getPinPostMessages: ActionCreator<any> =
  (
    postId: string,
    messageId?: string,
    before?: string,
    after?: string,
    isFresh = false,
  ) =>
  async (dispatch: Dispatch, getState: AppGetState) => {
    const {ppApiController} = getState().message;
    ppApiController?.abort?.();
    // eslint-disable-next-line no-undef
    const controller = new AbortController();
    if (!before) {
      SocketUtils.emitSeenPost(postId);
    }
    if (before) {
      dispatch({type: actionTypes.MESSAGE_PP_MORE, payload: {postId}});
    } else if (isFresh) {
      dispatch({
        type: actionTypes.MESSAGE_PP_FRESH,
        payload: {postId, controller},
      });
    } else {
      dispatch({
        type: actionTypes.MESSAGE_PP_REQUEST,
        payload: {postId, controller, messageId, after},
      });
    }
    try {
      let messageRes;
      if (messageId) {
        messageRes = await api.getAroundMessageById(messageId, 5);
      } else {
        messageRes = await api.getPinPostMessage(
          postId,
          before || after ? 5 : 20,
          before,
          after,
          controller,
        );
      }
      const messageData = normalizePublicMessageData(
        messageRes.data || [],
        messageRes.metadata?.encrypt_message_key,
      );
      if (messageRes.statusCode === 200) {
        dispatch({
          type: actionTypes.MESSAGE_PP_SUCCESS,
          payload: {
            data: messageData,
            channelId: postId,
            before,
            isFresh,
            reloadSocket: !before && !after && !messageId,
            messageId,
            after,
            canMoreAfter: messageRes.metadata?.can_loadmore_message_after,
            canMoreBefore: messageRes.metadata?.can_loadmore_message_before,
          },
        });
      } else {
        dispatch({
          type: actionTypes.MESSAGE_PP_FAIL,
          payload: messageRes,
        });
      }
    } catch (error) {
      dispatch({
        type: actionTypes.MESSAGE_PP_FAIL,
        payload: {message: error},
      });
    }
    dispatch({
      type: actionTypes.TOGGLE_SOCKET_RECONNECT,
      payload: {pinPostConversation: false},
    });
  };

export const getMessages: ActionCreator<any> =
  (
    channelId: string,
    channelType: string,
    before?: string,
    after?: string,
    isFresh = false,
  ) =>
  async (dispatch: Dispatch, getState: AppGetState) => {
    const payloadUpdateSocket =
      channelType === 'Direct'
        ? {directConversation: false}
        : {conversation: false};
    const {apiController, messageData} = getState().message;
    if (channelType !== 'Direct') {
      apiController?.abort?.();
    }
    if (!before) {
      const messages = messageData?.[channelId]?.data;
      SocketUtils.emitSeenChannel(messages?.[0]?.message_id, channelId);
    }
    // eslint-disable-next-line no-undef
    const controller = new AbortController();
    if (before) {
      dispatch({type: actionTypes.MESSAGE_MORE, payload: {channelId}});
    } else if (isFresh) {
      dispatch({
        type: actionTypes.MESSAGE_FRESH,
        payload: {channelId, channelType, controller},
      });
    } else {
      dispatch({
        type: actionTypes.MESSAGE_REQUEST,
        payload: {channelId, channelType, controller, after},
      });
    }
    try {
      const messageRes = await api.getMessages(
        channelId,
        after ? 10 : undefined,
        before,
        after,
        controller,
      );
      if (!before) {
        SocketUtils.emitSeenChannel(
          messageRes.data?.[0]?.message_id,
          channelId,
        );
      }
      const isPrivate = channelType === 'Private' || channelType === 'Direct';
      let messageData = [];
      if (isPrivate) {
        const privateChannelKeys = await getPrivateChannelKeys(
          getState().configs.privateKey,
          channelId,
        );
        dispatch({
          type: actionTypes.SET_CHANNEL_PRIVATE_KEY,
          payload: {
            ...getState().configs.channelPrivateKey,
            [channelId]: privateChannelKeys,
          },
        });
        messageData = await normalizeMessageData(
          messageRes.data || [],
          privateChannelKeys,
        );
      } else {
        messageData = normalizePublicMessageData(
          messageRes.data || [],
          messageRes.metadata?.encrypt_message_key,
        );
      }
      if (messageRes.statusCode === 200) {
        dispatch({
          type: actionTypes.MESSAGE_SUCCESS,
          payload: {
            data: messageData,
            channelId,
            before,
            isFresh,
            after,
            reloadSocket: false,
          },
        });
      } else {
        dispatch({
          type: actionTypes.MESSAGE_FAIL,
          payload: messageRes,
        });
      }
      dispatch({
        type: actionTypes.TOGGLE_SOCKET_RECONNECT,
        payload: payloadUpdateSocket,
      });
      return messageData;
    } catch (error) {
      dispatch({
        type: actionTypes.MESSAGE_FAIL,
        payload: {message: error},
      });
      dispatch({
        type: actionTypes.TOGGLE_SOCKET_RECONNECT,
        payload: payloadUpdateSocket,
      });
      return false;
    }
  };

export const setScrollData: ActionCreator<any> =
  (channelId: string, data: any) => (dispatch: Dispatch) => {
    dispatch({
      type: actionTypes.SET_CHANNEL_SCROLL_DATA,
      payload: {channelId, data},
    });
  };
