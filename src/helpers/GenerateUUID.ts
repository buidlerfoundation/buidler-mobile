import uuid from 'react-native-uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AsyncKey} from 'common/AppStorage';

export const getUniqueId = () => uuid.v4();

export const getDeviceCode = async () => {
  const current = await AsyncStorage.getItem(AsyncKey.deviceCode);
  if (typeof current === 'string') {
    return current;
  }
  const uuid = getUniqueId();
  AsyncStorage.setItem(AsyncKey.deviceCode, uuid);
  return uuid;
};
