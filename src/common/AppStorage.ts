import AsyncStorage from '@react-native-async-storage/async-storage';
import RNGoldenKeystore from 'react-native-golden-keystore';

const PrefixKey = 'Buidler_AsyncKey';

export const AsyncKey = {
  theme: PrefixKey + '_Theme',
  accessTokenKey: `${PrefixKey}_access_token`,
  refreshTokenKey: `${PrefixKey}_refresh_token`,
  lastChannelId: `${PrefixKey}_last_channel_id`,
  lastDirectChannelId: `${PrefixKey}_last_direct_channel_id`,
  lastTeamId: `${PrefixKey}_last_team_id`,
  ivKey: `${PrefixKey}_iv_key`,
  encryptedDataKey: `${PrefixKey}_encrypted_data_key`,
  deviceCode: `${PrefixKey}_device_code`,
  encryptedSeedKey: `${PrefixKey}_encrypted_seed_key`,
  channelPrivateKey: `${PrefixKey}_channel_private_key`,
  tokenExpire: `${PrefixKey}_token_expire_key`,
  refreshTokenExpire: `${PrefixKey}_refresh_token_expire_key`,
  emojiKey: `${PrefixKey}_emoji_key`,
  lastSyncChannelKey: `${PrefixKey}_last_sync_channel_key`,
  spaceToggleKey: `${PrefixKey}_space_toggle_key`,
  isBackup: `${PrefixKey}_is_backup`,
  loginType: `${PrefixKey}_login_type`,
  generatedPrivateKey: `${PrefixKey}_generated_private_key`,
  draftMessageKey: `${PrefixKey}_draft_message`,
};

export const GeneratedPrivateKey = async () => {
  const current = await AsyncStorage.getItem(AsyncKey.generatedPrivateKey);
  if (current) {
    return current;
  }
  const res = await RNGoldenKeystore.generateMnemonic();
  const privateKey = (
    await RNGoldenKeystore.createHDKeyPair(
      res,
      '',
      RNGoldenKeystore.CoinType.ETH.path,
      0,
    )
  ).private_key;
  await AsyncStorage.setItem(AsyncKey.generatedPrivateKey, privateKey);
  return privateKey;
};
