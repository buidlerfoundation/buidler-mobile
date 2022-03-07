import PermissionHelper from 'helpers/PermissionHelper';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import NavigationServices from 'services/NavigationServices';

export default {
  openImagePicker: (callback: (res: any) => void) => {
    PermissionHelper.checkPermissionCamera().then(grand => {
      if (grand) {
        const opt: any = {
          mediaType: 'photo',
          maxWidth: 1024,
          maxHeight: 1024,
          quality: 0.9,
        };
        NavigationServices.showActionSheet([
          {
            title: 'Camera',
            onPress: () => {
              launchCamera(opt, callback);
            },
          },
          {
            title: 'Photo',
            onPress: () => {
              launchImageLibrary(opt, callback);
            },
          },
          {
            title: 'Huỷ bỏ',
            onPress: () => {},
          },
        ]);
      }
    });
  },
};
