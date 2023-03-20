import {NotificationFilterType} from 'models';
import {ActionCreator, Dispatch} from 'redux';
import api from 'services/api';
import {actionTypes} from './actionTypes';

export const getNotifications: ActionCreator<any> =
  (filterType: NotificationFilterType, before?: string) =>
  async (dispatch: Dispatch) => {
    if (before) {
      dispatch({type: actionTypes.NOTIFICATION_MORE});
    } else {
      dispatch({type: actionTypes.NOTIFICATION_REQUEST});
    }
    const res = await api.getNotification(filterType, before);
    if (res.statusCode === 200) {
      dispatch({
        type: actionTypes.NOTIFICATION_SUCCESS,
        payload: {
          before,
          data: res.data,
          metadata: res.metadata,
          filterType,
        },
      });
      dispatch({
        type: actionTypes.TOGGLE_SOCKET_RECONNECT,
        payload: {notificationCenter: false},
      });
    } else {
      dispatch({
        type: actionTypes.NOTIFICATION_FAIL,
        payload: res,
      });
    }
  };

export const markAsReadNotification =
  notificationId => (dispatch: Dispatch) => {
    api.readNotification(notificationId);
    dispatch({
      type: actionTypes.MARK_AS_READ_NOTIFICATION,
      payload: notificationId,
    });
  };

export const markAsReadAllNotification = () => (dispatch: Dispatch) => {
  api.readAllNotification();
  dispatch({
    type: actionTypes.READ_ALL_NOTIFICATION,
  });
};

export const deleteNotification = notificationId => (dispatch: Dispatch) => {
  api.deleteNotification(notificationId);
  dispatch({
    type: actionTypes.DELETE_NOTIFICATION,
    payload: notificationId,
  });
};
