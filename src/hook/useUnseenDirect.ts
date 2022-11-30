import {useMemo} from 'react';
import useAppSelector from './useAppSelector';

const useUnseenDirect = () => {
  const directChannels = useAppSelector(state => state.user.directChannel);
  return useMemo(() => !!directChannels.find(el => !el.seen), [directChannels]);
};

export default useUnseenDirect;
