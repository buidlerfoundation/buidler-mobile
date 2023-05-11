import {Dispatch} from 'redux';
import {AppGetState} from 'renderer/store';
import {AsyncKey} from 'common/AppStorage';
import {actionTypes} from './actionTypes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {LocalAttachment} from 'models';

export const initialDraft = () => async (dispatch: Dispatch) => {
  const dataLocal = await AsyncStorage.getItem(AsyncKey.draftMessageKey);
  try {
    const data = JSON.parse(dataLocal);
    dispatch({type: actionTypes.INITIAL_DRAFT, payload: data});
  } catch (error) {
    console.log(error);
  }
};

export const updateDraft =
  (entityId: string, data?: {text: string}) =>
  async (dispatch: Dispatch, getState: AppGetState) => {
    const currentDraftData = getState().draft.data;
    const newDraftData = {
      ...currentDraftData,
      [entityId]: data,
    };
    AsyncStorage.setItem(
      AsyncKey.draftMessageKey,
      JSON.stringify(newDraftData),
    );
    dispatch({
      type: actionTypes.UPDATE_DRAFT,
      payload: {entityId, text: data?.text},
    });
  };

export const updateAttachmentDraft =
  (entityId: string, data?: {attachments?: LocalAttachment[]}) =>
  (dispatch: Dispatch) => {
    dispatch({
      type: actionTypes.UPDATE_ATTACHMENT_DRAFT,
      payload: {entityId, attachments: data?.attachments || []},
    });
  };
