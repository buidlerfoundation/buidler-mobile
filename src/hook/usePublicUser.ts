import {DeletedUser} from 'common/AppConfig';
import React from 'react';
import useTeamUserData from './useTeamUserData';

function usePublicUser(userId: string) {
  const teamUserData = useTeamUserData();

  return React.useMemo(
    () => teamUserData.find(el => el.user_id === userId) || DeletedUser,
    [teamUserData, userId],
  );
}

export default usePublicUser;
