/** @format */

import {Dimensions, Platform, PlatformIOSStatic} from 'react-native';

const {width, height} = Dimensions.get('window');

const isIphoneX =
  Platform.OS === 'ios' &&
  !Platform.isPad &&
  !Platform.isTVOS &&
  (height >= 812 || width >= 812);

export default {
  isIphoneX,
  isIPad: Platform.OS === 'ios' && Platform.isPad,
  ToolbarHeight: isIphoneX ? 35 : 0,
};
