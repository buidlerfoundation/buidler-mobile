import EthCrypto from 'eth-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AsyncKey} from 'common/AppStorage';
import store from '../store';
import {uniqBy} from 'lodash';
import {decrypt, encrypt} from 'eciesjs';
import CryptoJS from 'crypto-js';
import {Channel, UserData} from 'models';
import {getUniqueId} from './GenerateUUID';
import api from 'services/api';

export const encryptMessage = (str: string, channelId: string) => {
  const configs = store.getState()?.configs;
  const {channelPrivateKey} = configs;
  const keys = channelPrivateKey?.[channelId];
  const lastKey = keys?.[keys.length - 1]?.key;
  if (!lastKey) return '';
  const encrypted = CryptoJS.AES.encrypt(str, lastKey).toString();
  return encrypted;
};

export const decryptMessage = async (str: string, key: string) => {
  try {
    const res = await EthCrypto.decryptWithPrivateKey(key, JSON.parse(str));
    return res;
  } catch (error) {
    return null;
  }
};

const memberData = async (member: UserData, key: string, timestamp: number) => {
  // eslint-disable-next-line no-undef
  const encryptedKey = encrypt(member.user_id, Buffer.from(key)).toString(
    'hex',
  );
  return {
    key: encryptedKey,
    timestamp,
    user_id: member.user_id,
  };
};

export const createMemberChannelData = async (members: Array<UserData>) => {
  const uuid = getUniqueId();
  const timestamp = Math.round(new Date().getTime() / 1000);
  const req = members.map(el => memberData(el, uuid, timestamp));
  const res = await Promise.all(req);
  return {res, uuid};
};

export const getChannelPrivateKey = async (
  encrypted: string,
  privateKey: string,
) => {
  const res = decrypt(
    privateKey,
    // eslint-disable-next-line no-undef
    Buffer.from(encrypted, 'hex'),
  ).toString();
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
  const {channelId, key, timestamp} = item;
  const decryptedKey = decrypt(
    privateKey,
    // eslint-disable-next-line no-undef
    Buffer.from(key || '', 'hex'),
  );
  return {
    key: decryptedKey.toString(),
    timestamp: timestamp,
    channelId: channelId,
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

export const getPrivateChannelKeys = async (
  privateKey: string,
  channelId: string,
) => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const lastSyncChannelKey = await AsyncStorage.getItem(
    AsyncKey.lastSyncChannelKey,
  );
  const channelKeyRes = await api.getChannelKey(lastSyncChannelKey || 0);
  const syncChannelKey = channelKeyRes.data?.map(el => ({
    channelId: el.channel_id,
    key: el.key,
    timestamp: el.timestamp,
  }));
  const current = await AsyncStorage.getItem(AsyncKey.channelPrivateKey);
  let dataLocal: any = {data: []};
  if (typeof current === 'string') {
    dataLocal = JSON.parse(current);
  }
  dataLocal = uniqBy([...dataLocal.data, ...syncChannelKey], 'key');
  await AsyncStorage.setItem(
    AsyncKey.channelPrivateKey,
    JSON.stringify({data: dataLocal}),
  );
  await AsyncStorage.setItem(AsyncKey.lastSyncChannelKey, timestamp.toString());
  const req = dataLocal
    .filter(el => el.channelId === channelId)
    .map(el => decryptPrivateChannel(el, privateKey));
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
  }, {})[channelId];
};

export const getPrivateChannel = async (
  privateKey: string,
  syncFromSocket?: boolean,
) => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const lastSyncChannelKey = await AsyncStorage.getItem(
    AsyncKey.lastSyncChannelKey,
  );
  const channelKeyRes = await api.getChannelKey(lastSyncChannelKey || 0);
  const syncChannelKey = channelKeyRes.data?.map(el => ({
    channelId: el.channel_id,
    key: el.key,
    timestamp: el.timestamp,
  }));
  const current = await AsyncStorage.getItem(AsyncKey.channelPrivateKey);
  let dataLocal: any = {data: []};
  if (typeof current === 'string') {
    dataLocal = JSON.parse(current);
  }
  dataLocal = uniqBy([...dataLocal.data, ...syncChannelKey], 'key');
  await AsyncStorage.setItem(
    AsyncKey.channelPrivateKey,
    JSON.stringify({data: dataLocal}),
  );
  await AsyncStorage.setItem(AsyncKey.lastSyncChannelKey, timestamp.toString());
  const dataDecrypt = syncFromSocket ? syncChannelKey : dataLocal;
  const req = dataDecrypt.map(el => decryptPrivateChannel(el, privateKey));
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

export const normalizeMessageItem = async (item: any, key: string) => {
  let content = '';
  try {
    content = item.content
      ? CryptoJS.AES.decrypt(item.content, key).toString(CryptoJS.enc.Utf8)
      : '';
  } catch (error) {
    console.log(error);
  }
  if (item?.conversation_data) {
    item.conversation_data = await normalizeMessageItem(
      item.conversation_data,
      key,
    );
  }
  return {
    ...item,
    content,
  };
};

export const normalizePublicMessageItem = (item: any, key: string) => {
  const content = item.content
    ? CryptoJS.AES.decrypt(item.content, key).toString(CryptoJS.enc.Utf8)
    : '';
  if (item?.conversation_data) {
    item.conversation_data = normalizePublicMessageItem(
      item.conversation_data,
      key,
    );
  }
  return {
    ...item,
    content,
  };
};

export const normalizePublicMessageData = (
  messages: Array<any>,
  encryptMessageKey?: string,
) => {
  const configs: any = store.getState()?.configs;
  const {privateKey} = configs;
  const decryptMessageKey = decrypt(
    privateKey,
    // eslint-disable-next-line no-undef
    Buffer.from(encryptMessageKey || '', 'hex'),
  );
  const res =
    messages?.map?.(el =>
      normalizePublicMessageItem(el, decryptMessageKey.toString()),
    ) || [];
  return res.filter(el => !!el.content || el?.message_attachments?.length > 0);
};

export const normalizeMessageData = async (
  messages: Array<any>,
  keys: any[],
) => {
  if (keys.length === 0) return [];
  const req = messages.map(el =>
    normalizeMessageItem(
      el,
      findKey(keys, Math.round(new Date(el.createdAt).getTime() / 1000)).key,
    ),
  );
  const res = await Promise.all(req);
  return res.filter(el => !!el.content || el?.message_attachments?.length > 0);
};

export const findKey = (keys: Array<any>, created: number) => {
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

export const spaceNameToAvatar = (name: string, size?: number = 1) => {
  if (!name.trim()) return 'B';
  const split = name.trim().split(' ');
  let res = '';
  for (let index = 0; index < size; index++) {
    res += split[index].charAt(0);
  }
  return res;
};

export const sortChannel = (v1: Channel, v2: Channel) => {
  if ((v1.updatedAt || '') > (v2.updatedAt || '')) return -1;
  if ((v1.updatedAt || '') < (v2.updatedAt || '')) return 1;
  return 0;
};
