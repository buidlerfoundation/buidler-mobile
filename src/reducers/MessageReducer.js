import {actionTypes} from 'actions/actionTypes';

const initialState = {
  messageData: {},
  conversationData: {},
};

const messageReducers = (state = initialState, action) => {
  const {type, payload} = action;
  switch (type) {
    case actionTypes.CONVERSATION_SUCCESS: {
      const {parentId, data, before, isFresh} = payload;
      let cvs = data;
      if (before && state.conversationData?.[parentId]) {
        cvs = [...state.conversationData[parentId], ...data];
      }
      return {
        ...state,
        conversationData: {
          ...state.conversationData,
          [parentId]: cvs,
        },
      };
    }
    case actionTypes.EDIT_MESSAGE: {
      const {data} = payload;
      const {channel_id, message_id, content, plain_text, parent_id} = data;
      const newMessageData = state.messageData;
      const newConversationData = state.conversationData;
      if (newConversationData[parent_id]) {
        newConversationData[parent_id] = newConversationData[parent_id].map(
          el => {
            if (el.message_id === message_id) {
              el.content = content;
              el.plain_text = plain_text;
            }
            return el;
          },
        );
      }
      newMessageData[channel_id] = {
        ...newMessageData[channel_id],
        data: newMessageData[channel_id].data.map(msg => {
          if (msg.message_id === message_id) {
            msg.plain_text = plain_text;
            msg.content = content;
          }
          if (msg.parent_id === parent_id) {
            msg.conversation_data = msg.conversation_data.map(el => {
              if (el.message_id === message_id) {
                el.plain_text = plain_text;
                el.content = content;
              }
              return el;
            });
          }
          return msg;
        }),
      };
      return {
        ...state,
        messageData: newMessageData,
      };
    }
    case actionTypes.MESSAGE_SUCCESS: {
      const {channelId, data, before, isFresh} = payload;
      let msg = data;
      let scrollData = state.messageData?.[channelId]?.scrollData;
      if (
        (before || data.length === 0) &&
        state.messageData?.[channelId]?.data
      ) {
        msg = [...state.messageData[channelId].data, ...data];
      } else {
        scrollData = {
          showScrollDown: false,
        };
      }
      return {
        ...state,
        messageData: {
          ...state.messageData,
          [channelId]: {
            data: msg,
            canMore: data.length !== 0,
            scrollData,
          },
        },
      };
    }
    case actionTypes.SET_CHANNEL_SCROLL_DATA: {
      const {data, channelId} = payload;
      const newMessageData = state.messageData;
      if (newMessageData[channelId]) {
        newMessageData[channelId] = {
          ...newMessageData[channelId],
          scrollData: {
            ...newMessageData[channelId].scrollData,
            ...data,
          },
        };
      }
      return {
        ...state,
        messageData: newMessageData,
      };
    }
    case actionTypes.RECEIVE_MESSAGE: {
      const {data} = payload;
      if (!data.conversation_data) {
        data.conversation_data = [];
      }
      const newMessageData = state.messageData;
      const newConversationData = state.conversationData;
      if (newConversationData[data.parent_id]) {
        newConversationData[data.parent_id] = data.conversation_data;
      }
      if (newMessageData[data.channel_id]?.data) {
        if (data.conversation_data?.length > 0) {
          const newMessages = newMessageData[data.channel_id].data.filter(
            msg => msg.message_id !== data.parent_id,
          );
          newMessageData[data.channel_id] = {
            data: [data, ...newMessages],
          };
        } else {
          newMessageData[data.channel_id] = {
            ...newMessageData[data.channel_id],
            data: [data, ...newMessageData[data.channel_id].data],
          };
        }
      } else {
        newMessageData[data.channel_id] = {
          data: [data],
        };
      }
      return {
        ...state,
        messageData: newMessageData,
        conversationData: newConversationData,
      };
    }
    default:
      return state;
  }
};

export default messageReducers;
