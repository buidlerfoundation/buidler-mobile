import {useMemo} from 'react';
import useAppSelector from './useAppSelector';

const useSpaceChannel = () => {
  const spaceChannelMap = useAppSelector(state => state.user.spaceChannelMap);
  const communityId = useAppSelector(state => state.user.currentTeamId);
  return useMemo(
    () => spaceChannelMap[communityId] || [],
    [spaceChannelMap, communityId],
  );
};

export default useSpaceChannel;
