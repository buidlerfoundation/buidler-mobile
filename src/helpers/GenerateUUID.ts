import {v4 as uuidv4} from 'uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AsyncKey} from 'common/AppStorage';

export const getUniqueId = () => uuidv4();

export const getDeviceCode = async () => {
  const current = await AsyncStorage.getItem(AsyncKey.deviceCode);
  if (typeof current === 'string') {
    return current;
  }
  const uuid = getUniqueId();
  AsyncStorage.setItem(AsyncKey.deviceCode, uuid);
  return uuid;
};
