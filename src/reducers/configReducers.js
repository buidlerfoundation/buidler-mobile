import {actionTypes} from 'actions/actionTypes';

const initialState = {
  theme: 'dark',
  realHeight: 0,
};

export default (state = initialState, action) => {
  const {type, payload} = action;
  switch (type) {
    case actionTypes.SET_THEME: {
      return {
        ...state,
        theme: payload.theme,
      };
    }
    case actionTypes.SET_REAL_HEIGHT:
      return {
        ...state,
        realHeight: payload,
      };
    default:
      return state;
  }
};
