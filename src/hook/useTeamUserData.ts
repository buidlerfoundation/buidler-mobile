import {useMemo} from 'react';
import useAppSelector from './useAppSelector';

const useTeamUserData = () => {
  const teamUserMap = useAppSelector(state => state.user.teamUserMap);
  const communityId = useAppSelector(state => state.user.currentTeamId);
  return useMemo(
    () => teamUserMap[communityId]?.data || [],
    [teamUserMap, communityId],
  );
};

export default useTeamUserData;
