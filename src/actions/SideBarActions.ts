import AsyncStorage from '@react-native-async-storage/async-storage';
import {AsyncKey} from 'common/AppStorage';
import {ActionCreator, Dispatch} from 'redux';
import {AppGetState} from 'store';
import {actionTypes} from './actionTypes';

export const initialSpaceToggle: ActionCreator<any> =
  () => async (dispatch: Dispatch) => {
    const spaceToggleLocal = await AsyncStorage.getItem(
      AsyncKey.spaceToggleKey,
    );
    let newSpaceToggle = {};
    if (spaceToggleLocal && typeof spaceToggleLocal === 'string') {
      newSpaceToggle = JSON.parse(spaceToggleLocal);
    }
    dispatch({type: actionTypes.UPDATE_SPACE_TOGGLE, payload: newSpaceToggle});
  };

export const updateSpaceToggle: ActionCreator<any> =
  (spaceId: string, isExpand: boolean) =>
  async (dispatch: Dispatch, getState: AppGetState) => {
    const {spaceToggle} = getState().sideBar;
    const newSpaceToggle = {
      ...spaceToggle,
      [spaceId]: isExpand,
    };
    AsyncStorage.setItem(
      AsyncKey.spaceToggleKey,
      JSON.stringify(newSpaceToggle),
    );
    dispatch({type: actionTypes.UPDATE_SPACE_TOGGLE, payload: newSpaceToggle});
  };
