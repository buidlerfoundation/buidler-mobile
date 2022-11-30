import {actionTypes} from 'actions/actionTypes';
import {useMemo} from 'react';
import {createLoadingSelector} from 'reducers/selectors';
import useAppSelector from './useAppSelector';

const accessingSelector = createLoadingSelector([
  actionTypes.ACCESS_APP_PREFIX,
]);

const useAccessingApp = () => {
  const loading = useAppSelector(state => accessingSelector(state));
  return useMemo(() => loading, [loading]);
};

export default useAccessingApp;
