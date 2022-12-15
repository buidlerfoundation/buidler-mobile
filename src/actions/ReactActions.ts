import {Dispatch} from 'redux';
import api from 'services/api';
import HapticUtils from 'utils/HapticUtils';

export const addReact =
  (id: string, reactName: string, userId: string) =>
  async (dispatch: Dispatch) => {
    api.addReaction(id, {emoji_id: reactName, skin: 1});
    HapticUtils.trigger();
    dispatch({
      type: 'ACTION_ADD_REACT',
      payload: {id, reactName, userId},
    });
  };

export const removeReact =
  (id: string, reactName: string, userId: string) =>
  async (dispatch: Dispatch) => {
    api.removeReaction(id, {emoji_id: reactName});
    HapticUtils.trigger();
    dispatch({
      type: 'ACTION_REMOVE_REACT',
      payload: {id, reactName, userId},
    });
  };
