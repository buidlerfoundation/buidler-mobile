import {useMemo} from 'react';
import useAppSelector from './useAppSelector';

const useChannel = () => {
  const channelMap = useAppSelector(state => state.user.channelMap);
  const communityId = useAppSelector(state => state.user.currentTeamId);
  return useMemo(
    () => channelMap[communityId] || [],
    [channelMap, communityId],
  );
};

export default useChannel;
