import { Dispatch } from 'redux';
import api from 'services/api';
import { actionTypes } from './actionTypes';

export const addReact = (
  id: string,
  reactName: string,
  userId: string
) => async (dispatch: Dispatch) => {
  api.addReaction(id, { emoji_id: reactName, skin: 1 });
  dispatch({
    type: actionTypes.ADD_REACT,
    payload: { id, reactName, userId },
  });
};

export const removeReact = (
  id: string,
  reactName: string,
  userId: string
) => async (dispatch: Dispatch) => {
  api.removeReaction(id, { emoji_id: reactName });
  dispatch({
    type: actionTypes.REMOVE_REACT,
    payload: { id, reactName, userId },
  });
};
