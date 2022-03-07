import * as ConfigActions from './configActions';
import * as UserActions from './UserActions';
import * as TaskActions from './TaskActions';
import * as ReactActions from './ReactActions';
import * as MessageActions from './MessageActions';
import {ActionCreatorsMapObject} from 'redux';

const actions: ActionCreatorsMapObject<any> = {
  ...ConfigActions,
  ...UserActions,
  ...TaskActions,
  ...ReactActions,
  ...MessageActions,
};

export default actions;
