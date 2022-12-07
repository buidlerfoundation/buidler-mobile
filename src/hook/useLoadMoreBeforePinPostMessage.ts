import {actionTypes} from 'actions/actionTypes';
import {useSelector} from 'react-redux';
import {createLoadMoreSelector} from 'reducers/selectors';

const loadMoreSelector = createLoadMoreSelector([
  actionTypes.MESSAGE_PP_PREFIX,
]);

const useLoadMoreBeforePinPostMessage = () => {
  return useSelector(state => loadMoreSelector(state));
};

export default useLoadMoreBeforePinPostMessage;
