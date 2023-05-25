import {TonClient} from '@eversdk/core';

class VenomUtils {
  client: TonClient | null = null;
  constructor() {
    this.client = new TonClient();
  }
  generatedWallet = async () => {
    try {
      const walletKeys = await this.client.crypto.mnemonic_derive_sign_keys({
        phrase: 'xxx',
      });
      console.log('XXX: ', walletKeys);
    } catch (error) {
      console.log('XXX: ', error);
    }
  };
}

export default new VenomUtils();
