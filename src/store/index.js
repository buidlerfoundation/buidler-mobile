import {createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import {logger} from 'redux-logger';
import reducers from 'reducers';
const logs = [];
if (__DEV__) {
  logs.push(logger);
}
const store = createStore(reducers, applyMiddleware(...logs, thunk));

export default store;
