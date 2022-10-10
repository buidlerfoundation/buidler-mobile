import {utils} from 'ethers';
import {UserData} from 'models';

export const normalizeUserData = (user: UserData) => {
  const address = utils.computeAddress(user.user_id);
  return {
    ...user,
    address,
  };
};
