import {useMemo} from 'react';
import useAppSelector from './useAppSelector';

const useTeamUserData = (direct?: boolean) => {
  const teamUserMap = useAppSelector(state => state.user.teamUserMap);
  const directUsers = useAppSelector(state => state.user.directChannelUsers);
  const communityId = useAppSelector(state => state.user.currentTeamId);
  return useMemo(
    () => (direct ? directUsers : teamUserMap[communityId]?.data || []),
    [direct, directUsers, teamUserMap, communityId],
  );
};

export default useTeamUserData;
