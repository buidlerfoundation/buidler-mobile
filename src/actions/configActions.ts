import AsyncStorage from '@react-native-async-storage/async-storage';
import {AsyncKey} from 'common/AppStorage';
import {ThemeType} from 'models';
import {ActionCreator, Dispatch} from 'redux';
import {actionTypes} from './actionTypes';

export const setTheme: ActionCreator<any> =
  (theme: ThemeType) => async (dispatch: Dispatch) => {
    AsyncStorage.setItem(AsyncKey.theme, theme);
    dispatch({type: actionTypes.SET_THEME, payload: {theme}});
  };

export const setRealHeight = (height: number) => (dispatch: Dispatch) => {
  dispatch({type: actionTypes.SET_REAL_HEIGHT, payload: height});
};
