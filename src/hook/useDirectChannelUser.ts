import React from 'react';
import useDirectChannel from './useDirectChannel';
import useDirectUser from './useDirectUser';
import useUserData from './useUserData';

function useDirectChannelUser() {
  const currentChannel = useDirectChannel();
  const user = useUserData();
  const otherUserId = React.useMemo(
    () => currentChannel?.channel_members.find(el => el !== user.user_id),
    [currentChannel?.channel_members, user.user_id],
  );

  return useDirectUser(otherUserId);
}

export default useDirectChannelUser;
