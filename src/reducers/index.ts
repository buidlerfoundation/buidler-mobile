import {combineReducers} from 'redux';
import configReducers from './configReducers';
import LoadingReducer from './loadingReducer';
import LoadMoreReducer from './loadmoreReducer';
import ErrorReducer from './errorReducer';
import UserReducers from './UserReducers';
import TaskReducers from './TaskReducers';
import ReactReducers from './ReactReducers';
import MessageReducer from './MessageReducer';
import refreshReducer from './refreshReducer';
import networkReducer from './NetworkReducer';
import transactionReducer from './TransactionReducer';
import collectibleReducer from './CollectibleReducers';
import galleryReducer from './GalleryReducers';
import notificationReducer from './NotificationReducers';
import sideBarReducers from './SideBarReducers';
import socketReducers from './SocketReducers';
import draftReducers from './DraftReducers';

const appReducer = combineReducers({
  configs: configReducers,
  error: ErrorReducer,
  loading: LoadingReducer,
  user: UserReducers,
  task: TaskReducers,
  reactReducer: ReactReducers,
  message: MessageReducer,
  loadmore: LoadMoreReducer,
  refresh: refreshReducer,
  network: networkReducer,
  transaction: transactionReducer,
  collectible: collectibleReducer,
  gallery: galleryReducer,
  notification: notificationReducer,
  sideBar: sideBarReducers,
  socket: socketReducers,
  draft: draftReducers,
});

const rootReducer = (state, action) => {
  return appReducer(state, action);
};

export default rootReducer;
