import React from 'react';
import useAppSelector from './useAppSelector';

function useCommunityId() {
  const communityId = useAppSelector(state => state.user.currentTeamId);

  return React.useMemo(() => communityId, [communityId]);
}

export default useCommunityId;
