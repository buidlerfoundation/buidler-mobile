import {useMemo} from 'react';
import useAppSelector from './useAppSelector';
import useCommunityId from './useCommunityId';

const useTotalTeamUserData = () => {
  const teamUserMap = useAppSelector(state => state.user.teamUserMap);
  const communityId = useCommunityId();
  return useMemo(
    () => teamUserMap[communityId]?.total || 0,
    [teamUserMap, communityId],
  );
};

export default useTotalTeamUserData;
