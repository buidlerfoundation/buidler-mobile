import React from 'react';
import useAppSelector from './useAppSelector';

function useDirectUser(userId: string) {
  const directUsers = useAppSelector(state => state.user.directChannelUsers);

  return React.useMemo(
    () => directUsers.find(el => el.user_id === userId),
    [directUsers, userId],
  );
}

export default useDirectUser;
