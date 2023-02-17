import {actionTypes} from 'actions/actionTypes';
import {useSelector} from 'react-redux';
import {createLoadingSelector} from 'reducers/selectors';

const loadingSelector = createLoadingSelector([actionTypes.MESSAGE_PP_PREFIX]);

const useLoadingPinPostMessage = () => {
  return useSelector(state => loadingSelector(state));
};

export default useLoadingPinPostMessage;
