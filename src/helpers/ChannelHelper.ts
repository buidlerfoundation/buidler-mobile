import {ethers, utils} from 'ethers';
import EthCrypto from 'eth-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AsyncKey} from 'common/AppStorage';
import store from '../store';
import {uniqBy} from 'lodash';

export const encryptMessage = async (str: string, key: string) => {
  const pubKey = utils.computePublicKey(key, true);
  const res = await EthCrypto.encryptWithPublicKey(pubKey.slice(2), str);
  return JSON.stringify(res);
};

export const decryptMessage = async (str: string, key: string) => {
  try {
    const res = await EthCrypto.decryptWithPrivateKey(key, JSON.parse(str));
    return res;
  } catch (error) {
    return null;
  }
};

const memberData = async (
  member: any,
  privateKey: string,
  timestamp: number,
) => {
  const key = await EthCrypto.encryptWithPublicKey(
    member.user_id.slice(2),
    privateKey,
  );
  return {
    key: JSON.stringify(key),
    timestamp,
    user_id: member.user_id,
  };
};

export const createMemberChannelData = async (members: Array<any>) => {
  const {privateKey} = ethers.Wallet.createRandom();
  const timestamp = new Date().getTime();
  const req = members.map(el => memberData(el, privateKey, timestamp));
  const res = await Promise.all(req);
  return {res, privateKey};
};

export const getChannelPrivateKey = async (
  encrypted: string,
  privateKey: string,
) => {
  const res = await EthCrypto.decryptWithPrivateKey(
    privateKey,
    JSON.parse(encrypted),
  );
  return res;
};

export const storePrivateChannel = async (
  channelId: string,
  key: string,
  timestamp: number,
) => {
  const current = await AsyncStorage.getItem(AsyncKey.channelPrivateKey);
  let res: any = {};
  if (typeof current === 'string') {
    res = JSON.parse(current);
  }
  res[channelId] = uniqBy(
    [...(res?.[channelId] || []), {key, timestamp}],
    'key',
  );
  AsyncStorage.setItem(AsyncKey.channelPrivateKey, JSON.stringify(res));
};

const decryptPrivateChannel = async (item: any, privateKey: string) => {
  const key = await getChannelPrivateKey(item.key, privateKey);
  return {
    key,
    timestamp: item.timestamp,
    channelId: item.channelId,
  };
};

export const getRawPrivateChannel = async () => {
  const current = await AsyncStorage.getItem(AsyncKey.channelPrivateKey);
  let res: any = {};
  if (typeof current === 'string') {
    res = JSON.parse(current);
  }
  return res;
};

export const getPrivateChannel = async (privateKey: string) => {
  const current = await AsyncStorage.getItem(AsyncKey.channelPrivateKey);
  // const current = JSON.stringify(testData);
  let dataLocal: any = {};
  if (typeof current === 'string') {
    dataLocal = JSON.parse(current);
  } else {
    return {};
  }
  let req: Array<any> = [];
  Object.keys(dataLocal).forEach(k => {
    req = [
      ...req,
      ...(dataLocal?.[k]?.map?.((el: any) => ({channelId: k, ...el})) || []),
    ];
  });
  req = req.map(el => decryptPrivateChannel(el, privateKey));
  const res = await Promise.all(req);
  return res.reduce((result, val) => {
    const {channelId, key, timestamp} = val;
    if (result[channelId]) {
      const prev = result[channelId];
      prev[prev.length - 1] = {...prev[prev.length - 1], expire: timestamp};
      result[channelId] = [...prev, {key, timestamp}];
    } else {
      result[channelId] = [{key, timestamp}];
    }
    return result;
  }, {});
};

export const normalizeMessageItem = async (
  item: any,
  key: string,
  channelId: string,
) => {
  const content = await decryptMessage(item.content, key);
  const plain_text = await decryptMessage(item.plain_text, key);
  if (item?.conversation_data?.length > 0) {
    if (channelId) {
      item.conversation_data = await normalizeMessageData(
        item.conversation_data,
        channelId,
      );
    } else {
      item.conversation_data = await normalizePublicMessageData(
        item.conversation_data,
      );
    }
  }
  return {
    ...item,
    content,
    plain_text,
  };
};

export const normalizePublicMessageData = async (messages: Array<any>) => {
  return messages;
  // const configs: any = store.getState()?.configs;
  // const {privateKey} = configs;
  // const req = messages?.map?.(el => normalizeMessageItem(el, privateKey)) || [];
  // const res = await Promise.all(req);
  // return res.filter(el => !!el.content);
};

export const normalizeMessageData = async (
  messages: Array<any>,
  channelId: string,
) => {
  const configs: any = store.getState()?.configs;
  const {channelPrivateKey} = configs;
  const keys = channelPrivateKey?.[channelId] || [];
  if (keys.length === 0) return [];
  const req = messages.map(el =>
    normalizeMessageItem(
      el,
      findKey(keys, new Date(el.createdAt).getTime()).key,
      channelId,
    ),
  );
  const res = await Promise.all(req);
  return res.filter(el => !!el.content);
};

const findKey = (keys: Array<any>, created: number) => {
  return keys.find(el => {
    if (el.expire) {
      return el.timestamp <= created && el.expire >= created;
    }
    return true;
  });
};

export const uniqChannelPrivateKey = async () => {
  const current = await AsyncStorage.getItem(AsyncKey.channelPrivateKey);
  let dataLocal: any = {};
  if (typeof current === 'string') {
    dataLocal = JSON.parse(current);
    const newObj: any = {};
    Object.keys(dataLocal).forEach(k => {
      newObj[k] = uniqBy(dataLocal[k], 'key');
    });
    await AsyncStorage.setItem(
      AsyncKey.channelPrivateKey,
      JSON.stringify(newObj),
    );
  }
};
