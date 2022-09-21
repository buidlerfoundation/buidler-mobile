import CryptoJS from 'crypto-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AsyncKey} from 'common/AppStorage';

export const getIV = async () => {
  const ivStorage: any = await AsyncStorage.getItem(AsyncKey.ivKey);
  if (!ivStorage) {
    const iv = CryptoJS.lib.WordArray.random(16);
    AsyncStorage.setItem(AsyncKey.ivKey, JSON.stringify(iv));
    return iv;
  }
  return JSON.parse(ivStorage);
};

export const encryptData = (
  data: any,
  password: string,
  iv?: CryptoJS.lib.WordArray,
) => {
  if (!data) throw new Error('Data must not be null');
  return CryptoJS.AES.encrypt(data, password, {iv});
};

export const decryptData = (
  encryptedData: any,
  password: string,
  iv?: CryptoJS.lib.WordArray,
) => {
  if (!encryptedData) throw new Error('Data must not be null');
  return CryptoJS.AES.decrypt(encryptedData, password, {iv});
};

export const encryptString = (
  string: string,
  password: string,
  iv?: CryptoJS.lib.WordArray,
) => {
  const encrypted = encryptData(string, password, iv);
  return encrypted.toString();
};

export const decryptString = (
  string: string,
  password: string,
  iv?: CryptoJS.lib.WordArray,
) => {
  const decrypted = decryptData(string, password, iv);
  return decrypted.toString(CryptoJS.enc.Utf8);
};

export default {
  encryptData,
  decryptData,
  encryptString,
  decryptString,
};
