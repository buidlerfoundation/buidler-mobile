import makeBlockie from 'ethereum-blockies-base64';
import {utils} from 'ethers';
import {UserData} from 'models';

export const normalizeUserData = (user: UserData) => {
  const address = utils.computeAddress(user.user_id);
  return {
    ...user,
    addressAvatar: makeBlockie(address),
    address,
  };
};
