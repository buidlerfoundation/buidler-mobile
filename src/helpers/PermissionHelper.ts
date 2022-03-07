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
    return res.status == RESULTS.GRANTED;
  };
  requestPermissionNotification = async () => {
    const res = await requestNotifications(['alert', 'sound']);
    return res.status == RESULTS.GRANTED;
  };

  checkLimitPhotoIOS = async () => {
    if (Platform.OS === 'android') return false;
    const res = await check(PERMISSIONS.IOS.PHOTO_LIBRARY);
    return res === RESULTS.LIMITED;
  };

  checkPermissionCamera = async () => {
    const {ANDROID, IOS} = PERMISSIONS;
    const requestPermission: Array<any> = [];
    let permissionCamera: Permission = null;
    let permissionPhoto: Permission = null;
    let permissionSavePhoto: Permission = null;
    // let permissionRecordAudio: Permission = null;
    if (Platform.OS == 'android') {
      permissionCamera = ANDROID.CAMERA;
      permissionPhoto = ANDROID.READ_EXTERNAL_STORAGE;
      permissionSavePhoto = ANDROID.WRITE_EXTERNAL_STORAGE;
      // permissionRecordAudio = ANDROID.RECORD_AUDIO;

      const [
        cameraStatus,
        readPhotoStatus,
        savePhotoStatus,
        // recordAudioStatus,
      ] = await Promise.all([
        check(permissionCamera),
        check(permissionPhoto),
        check(permissionSavePhoto),
        // check(permissionRecordAudio),
      ]);
      if (
        cameraStatus == RESULTS.GRANTED &&
        readPhotoStatus == RESULTS.GRANTED &&
        savePhotoStatus == RESULTS.GRANTED
        // recordAudioStatus == RESULTS.GRANTED
      )
        return true;
      if (
        cameraStatus == RESULTS.BLOCKED ||
        readPhotoStatus == RESULTS.BLOCKED ||
        savePhotoStatus == RESULTS.BLOCKED
        // recordAudioStatus == RESULTS.BLOCKED
      ) {
        this.requestSettingCamera();
        return false;
      }
      if (cameraStatus == RESULTS.DENIED) {
        requestPermission.push(ANDROID.CAMERA);
      }
      if (readPhotoStatus == RESULTS.DENIED) {
        requestPermission.push(ANDROID.READ_EXTERNAL_STORAGE);
      }
      if (savePhotoStatus == RESULTS.DENIED) {
        requestPermission.push(ANDROID.WRITE_EXTERNAL_STORAGE);
      }
      // if (recordAudioStatus == RESULTS.DENIED) {
      //   requestPermission.push(ANDROID.RECORD_AUDIO);
      // }
      const requestStatus: any = await PermissionsAndroid.requestMultiple(
        requestPermission,
      );
      requestPermission.forEach(p => {
        if (requestStatus[p] != RESULTS.GRANTED) {
          return false;
        }
      });
      return true;
    } else {
      permissionCamera = IOS.CAMERA;
      permissionPhoto = IOS.PHOTO_LIBRARY;
      // permissionRecordAudio = IOS.MICROPHONE;
      const [
        cameraStatus,
        readPhotoStatus,
        // recordAudioStatus,
      ] = await Promise.all([
        check(permissionCamera),
        check(permissionPhoto),
        // check(permissionRecordAudio),
      ]);
      if (
        cameraStatus == RESULTS.GRANTED &&
        (readPhotoStatus == RESULTS.GRANTED ||
          readPhotoStatus == RESULTS.LIMITED)
        // recordAudioStatus == RESULTS.GRANTED
      )
        return true;
      if (
        cameraStatus == RESULTS.BLOCKED ||
        readPhotoStatus == RESULTS.BLOCKED
        // recordAudioStatus == RESULTS.BLOCKED
      ) {
        this.requestSettingCamera();
        return false;
      }

      if (cameraStatus == RESULTS.DENIED) {
        requestPermission.push(request(permissionCamera));
      }
      if (readPhotoStatus == RESULTS.DENIED) {
        requestPermission.push(request(permissionPhoto));
      }
      const requestStatus = await Promise.all(requestPermission);
      return requestStatus.find(status => status != RESULTS.GRANTED) !== null;
    }
  };

  requestSettingCamera = () => {
    Alert.alert(
      'Alert',
      'Notable need to access to your camera and photos to use that feature',
      [{text: 'Cancel'}, {text: 'Open Setting', onPress: () => openSettings()}],
    );
  };
}

export default new PermissionHelper();
