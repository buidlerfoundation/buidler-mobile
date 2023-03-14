import {utils} from 'ethers';
import {useMemo} from 'react';
import useUserData from './useUserData';

function useUserAddress() {
  const user = useUserData();
  return useMemo(() => utils.computeAddress(user.user_id), [user.user_id]);
}

export default useUserAddress;
