import {utils} from 'ethers';
import RNGoldenKeystore from 'react-native-golden-keystore';

export const createConfirmSeedState = () => {
  return new Array(12).fill({}).map((_, index) => ({index, title: ''}));
};

export const isValidPrivateKey = (key: string) => {
  if (key.length === 52) {
    return key.match(/^[0-9A-Za-z]{52}$/);
  }
  const regex = /^[0-9A-Fa-f]{64}$/;
  return key.match(regex);
};

export const addressFromSeed = async (seed: string) => {
  const pk = isValidPrivateKey(seed)
    ? seed
    : (
        await RNGoldenKeystore.createHDKeyPair(
          seed,
          '',
          RNGoldenKeystore.CoinType.ETH.path,
          0,
        )
      ).private_key;
  const publicKey = utils.computePublicKey(`0x${pk}`, true);
  const address = utils.computeAddress(publicKey);
  return address;
};
