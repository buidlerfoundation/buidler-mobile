import {useMemo} from 'react';
import useAppSelector from './useAppSelector';

const useUnseenCommunity = () => {
  const team = useAppSelector(state => state.user.team);
  return useMemo(() => !!team?.find(el => !el.seen), [team]);
};

export default useUnseenCommunity;
