import {Community} from 'models';
import React from 'react';
import useAppSelector from './useAppSelector';
import useCommunityId from './useCommunityId';

function useCurrentCommunity() {
  const communityId = useCommunityId();
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
