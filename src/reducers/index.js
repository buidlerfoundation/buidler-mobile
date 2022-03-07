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
});

const rootReducer = (state, action) => {
  // if (action.type === actions.userTypes.LOG_OUT) {
  //   state = undefined;
  // }
  return appReducer(state, action);
};

export default rootReducer;
