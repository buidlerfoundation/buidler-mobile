import {actionTypes} from 'actions/actionTypes';
import {AnyAction, Reducer} from 'redux';
import ChainId from 'services/connectors/ChainId';

type NetworkReducerState = {
  chainId: number | string;
};

const initialState: NetworkReducerState = {
  chainId: ChainId.EthereumMainnet,
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
