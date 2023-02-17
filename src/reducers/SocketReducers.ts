import {actionTypes} from 'actions/actionTypes';
import {AnyAction, Reducer} from 'redux';

type SocketReducerState = {
  directChannel: boolean;
  directConversation: boolean;
  conversation: boolean;
  channel: boolean;
  community: boolean;
};

const initialState: SocketReducerState = {
  directChannel: false,
  directConversation: false,
  conversation: false,
  channel: false,
  community: false,
};

const socketReducers: Reducer<SocketReducerState, AnyAction> = (
  state = initialState,
  action,
) => {
  const {type, payload} = action;
  switch (type) {
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
