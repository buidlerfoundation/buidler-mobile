import {utils} from 'ethers';
import {useMemo} from 'react';
import useUserData from './useUserData';

function useUserAddress() {
  const user = useUserData();
  return useMemo(() => {
    try {
      const address = utils.computeAddress(user.user_id);
      return address;
    } catch (e) {
      return '';
    }
  }, [user.user_id]);
}

export default useUserAddress;
