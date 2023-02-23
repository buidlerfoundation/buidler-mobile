import {actionTypes} from 'actions/actionTypes';
import {CHAIN_ID} from 'react-native-dotenv';
import {AnyAction, Reducer} from 'redux';

type NetworkReducerState = {
  chainId: number | string;
};

const initialState: NetworkReducerState = {
  chainId: CHAIN_ID,
};

const networkReducers: Reducer<NetworkReducerState, AnyAction> = (
  state = initialState,
  action,
) => {
  const {type, payload} = action;
  switch (type) {
    case actionTypes.SWITCH_NETWORK: {
      return {
        ...state,
        chainId: payload,
      };
    }

    default:
      return state;
  }
};

export default networkReducers;
