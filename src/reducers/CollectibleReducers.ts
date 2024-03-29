import {actionTypes} from 'actions/actionTypes';
import {AnyAction, Reducer} from 'redux';
import {NFTCollectionDataApi} from 'models';

type CollectibleReducerState = {
  data: Array<NFTCollectionDataApi>;
};

const initialState: CollectibleReducerState = {
  data: [],
};

const collectibleReducers: Reducer<CollectibleReducerState, AnyAction> = (
  state = initialState,
  action,
) => {
  const {type, payload} = action;
  switch (type) {
    case actionTypes.COLLECTIBLE_SUCCESS: {
      const {data} = payload;
      return {
        ...state,
        data,
      };
    }
    default:
      return state;
  }
};

export default collectibleReducers;
