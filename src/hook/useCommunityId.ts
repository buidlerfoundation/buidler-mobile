import AppConfig from 'common/AppConfig';
import React from 'react';
import useAppSelector from './useAppSelector';

function useCommunityId(direct?: boolean) {
  const communityId = useAppSelector(state => state.user.currentTeamId);

  return React.useMemo(
    () => (direct ? AppConfig.directCommunityId : communityId),
    [communityId, direct],
  );
}

export default useCommunityId;
