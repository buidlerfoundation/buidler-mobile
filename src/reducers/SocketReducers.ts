import {actionTypes} from 'actions/actionTypes';
import {AnyAction, Reducer} from 'redux';

type SocketReducerState = {
  directChannel: boolean;
  directConversation: boolean;
  conversation: boolean;
  channel: boolean;
  community: boolean;
  pinPost: boolean;
  pinPostConversation: boolean;
  socketConnecting: boolean;
  notificationCenter: boolean;
};

const initialState: SocketReducerState = {
  directChannel: false,
  directConversation: false,
  conversation: false,
  channel: false,
  community: false,
  pinPost: false,
  pinPostConversation: false,
  notificationCenter: false,
  socketConnecting: false,
};

const socketReducers: Reducer<SocketReducerState, AnyAction> = (
  state = initialState,
  action,
) => {
  const {type, payload} = action;
  switch (type) {
    case actionTypes.SOCKET_CONNECTING: {
      return {
        ...state,
        socketConnecting: payload,
      };
    }
    case actionTypes.TOGGLE_SOCKET_RECONNECT: {
      return {
        ...state,
        ...payload,
      };
    }
    default:
      return state;
  }
};

export default socketReducers;
