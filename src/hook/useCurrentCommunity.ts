import React from 'react';
import {Community} from 'renderer/models';
import useAppSelector from './useAppSelector';

function useCurrentCommunity() {
  const communityId = useAppSelector(state => state.user.currentTeamId);
  const community = useAppSelector(state => state.user.team);

  return React.useMemo<Community>(() => {
    const res = community?.find(el => el.team_id === communityId) || {
      team_display_name: '',
      team_icon: '',
      team_id: '',
      team_url: '',
      role: '',
    };
    return res;
  }, [community, communityId]);
}

export default useCurrentCommunity;
