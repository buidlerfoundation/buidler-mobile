import {getUserDetail} from 'actions/UserActions';
import {DeletedUser} from 'common/AppConfig';
import {UserData} from 'models';
import React, {useEffect, useState} from 'react';
import useAppDispatch from './useAppDispatch';
import useCommunityId from './useCommunityId';
import useTeamUserData from './useTeamUserData';

function useUserById(userId?: string, direct?: boolean) {
  const users = useTeamUserData(direct);
  const communityId = useCommunityId(direct);
  const dispatch = useAppDispatch();
  const [user, setUser] = useState<UserData | null>(null);
  useEffect(() => {
    if (userId) {
      const existed = users.find(el => el.user_id === userId);
      if (!existed) {
        dispatch(getUserDetail(userId, communityId));
      } else if (!existed.fetching && !existed.user_name) {
        setUser(DeletedUser);
      } else if (existed.user_name) {
        setUser(existed);
      }
    }
  }, [communityId, dispatch, userId, users]);
  return React.useMemo(() => {
    if (user?.is_deleted) return DeletedUser;
    return user;
  }, [user]);
}

export default useUserById;
