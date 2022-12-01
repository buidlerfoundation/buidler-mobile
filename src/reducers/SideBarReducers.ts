import {actionTypes} from 'actions/actionTypes';
import {AnyAction, Reducer} from 'redux';

type SideBarReducerState = {
  spaceToggle: {[spaceId: string]: boolean};
};

const initialState: SideBarReducerState = {
  spaceToggle: {},
};

const sideBarReducers: Reducer<SideBarReducerState, AnyAction> = (
  state = initialState,
  action,
) => {
  const {type, payload} = action;
  switch (type) {
    case actionTypes.UPDATE_SPACE_TOGGLE: {
      return {
        ...state,
        spaceToggle: payload,
      };
    }
    default:
      return state;
  }
};

export default sideBarReducers;
