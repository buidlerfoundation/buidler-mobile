import {actionTypes} from 'actions/actionTypes';

const initialState = {
  theme: 'dark',
  realHeight: 0,
  privateKey: '',
  seed: '',
  channelPrivateKey: {},
  openOTP: false,
  requestOtpCode: '',
};

export default (state = initialState, action) => {
  const {type, payload} = action;
  switch (type) {
    case actionTypes.TOGGLE_OTP: {
      return {
        ...state,
        openOTP: payload?.open != null ? payload?.open : !state.openOTP,
        requestOtpCode: payload?.otp || '',
      };
    }
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
    case actionTypes.SET_CHANNEL_PRIVATE_KEY: {
      return {
        ...state,
        channelPrivateKey: payload,
      };
    }
    case actionTypes.SET_PRIVATE_KEY: {
      return {
        ...state,
        privateKey: payload,
      };
    }
    case actionTypes.REMOVE_PRIVATE_KEY: {
      return {
        ...state,
        privateKey: '',
      };
    }
    default:
      return state;
  }
};
