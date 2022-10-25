import {Platform, Alert, PermissionsAndroid} from 'react-native';
import {
  check,
  request,
  openSettings,
  PERMISSIONS,
  RESULTS,
  Permission,
  checkNotifications,
  requestNotifications,
  openLimitedPhotoLibraryPicker,
} from 'react-native-permissions';

class PermissionHelper {
  openPhotoSetting = () => openSettings();
  openSelectPhoto = () => openLimitedPhotoLibraryPicker();
  checkPermissionNotification = async () => {
    const res = await checkNotifications();
    return res.status === RESULTS.GRANTED;
  };
  requestPermissionNotification = async () => {
    const res = await requestNotifications(['alert', 'sound']);
    return res.status === RESULTS.GRANTED;
  };

  checkLimitPhotoIOS = async () => {
    if (Platform.OS === 'android') return false;
    const res = await check(PERMISSIONS.IOS.PHOTO_LIBRARY);
    return res === RESULTS.LIMITED;
  };

  checkPermissionPhoto = async () => {
    const {ANDROID, IOS} = PERMISSIONS;
    const requestPermission: Array<any> = [];
    let permissionPhoto: Permission = null;
    let permissionSavePhoto: Permission = null;
    if (Platform.OS === 'android') {
      permissionPhoto = ANDROID.READ_EXTERNAL_STORAGE;
      permissionSavePhoto = ANDROID.WRITE_EXTERNAL_STORAGE;
      const [readPhotoStatus, savePhotoStatus] = await Promise.all([
        check(permissionPhoto),
        check(permissionSavePhoto),
      ]);
      if (
        readPhotoStatus === RESULTS.GRANTED &&
        savePhotoStatus === RESULTS.GRANTED
      )
        return true;
      if (
        readPhotoStatus === RESULTS.BLOCKED ||
        savePhotoStatus === RESULTS.BLOCKED
      ) {
        return false;
      }
      if (readPhotoStatus === RESULTS.DENIED) {
        requestPermission.push(ANDROID.READ_EXTERNAL_STORAGE);
      }
      if (savePhotoStatus === RESULTS.DENIED) {
        requestPermission.push(ANDROID.WRITE_EXTERNAL_STORAGE);
      }
      const requestStatus: any = await PermissionsAndroid.requestMultiple(
        requestPermission,
      );
      requestPermission.forEach(p => {
        if (requestStatus[p] !== RESULTS.GRANTED) {
          return false;
        }
      });
      return true;
    } else {
      permissionPhoto = IOS.PHOTO_LIBRARY;
      const [readPhotoStatus] = await Promise.all([check(permissionPhoto)]);
      if (
        readPhotoStatus === RESULTS.GRANTED ||
        readPhotoStatus === RESULTS.LIMITED
      )
        return true;
      if (readPhotoStatus === RESULTS.BLOCKED) {
        return false;
      }
      if (readPhotoStatus === RESULTS.DENIED) {
        requestPermission.push(request(permissionPhoto));
      }
      const requestStatus = await Promise.all(requestPermission);
      return requestStatus.find(status => status !== RESULTS.GRANTED) !== null;
    }
  };

  checkPermissionCamera = async () => {
    const {ANDROID, IOS} = PERMISSIONS;
    const requestPermission: Array<any> = [];
    let permissionCamera: Permission = null;
    if (Platform.OS === 'android') {
      permissionCamera = ANDROID.CAMERA;
      const [cameraStatus] = await Promise.all([check(permissionCamera)]);
      if (cameraStatus === RESULTS.GRANTED) return true;
      if (cameraStatus === RESULTS.BLOCKED) {
        return false;
      }
      if (cameraStatus === RESULTS.DENIED) {
        requestPermission.push(ANDROID.CAMERA);
      }
      const requestStatus: any = await PermissionsAndroid.requestMultiple(
        requestPermission,
      );
      requestPermission.forEach(p => {
        if (requestStatus[p] !== RESULTS.GRANTED) {
          return false;
        }
      });
      return true;
    } else {
      permissionCamera = IOS.CAMERA;
      const [cameraStatus] = await Promise.all([check(permissionCamera)]);
      if (cameraStatus === RESULTS.GRANTED) return true;
      if (cameraStatus === RESULTS.BLOCKED) {
        return false;
      }

      if (cameraStatus === RESULTS.DENIED) {
        requestPermission.push(request(permissionCamera));
      }
      const requestStatus = await Promise.all(requestPermission);
      return requestStatus.find(status => status !== RESULTS.GRANTED) !== null;
    }
  };

  requestSettingCamera = () => {
    Alert.alert(
      'Alert',
      'Buidler need to access to your camera to use that feature',
      [{text: 'Cancel'}, {text: 'Open Setting', onPress: () => openSettings()}],
    );
  };

  requestSettingPhoto = () => {
    Alert.alert(
      'Alert',
      'Buidler need to access to your photos to use that feature',
      [{text: 'Cancel'}, {text: 'Open Setting', onPress: () => openSettings()}],
    );
  };
}

export default new PermissionHelper();
