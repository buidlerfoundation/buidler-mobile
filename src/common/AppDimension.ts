import {Dimensions, Platform, StatusBar} from 'react-native';
import AppDevice from './AppDevice';

const screenSize = Dimensions.get('screen');
const windowSize = Dimensions.get('window');

class AppDimension {
  bottomSheetNavbarAndroid = 0;
  bottomSheetCreate = 180;
  width = windowSize.width;
  height = windowSize.height;
  extraBottom = AppDevice.isIphoneX ? 34 : AppDevice.isIPad ? 20 : 0;
  extraTop =
    Platform.OS === 'ios'
      ? AppDevice.isIphoneX
        ? 44
        : 20
      : StatusBar.currentHeight;
  headerHeight = Platform.OS === 'ios' ? 44 : 56;
  bottomTabbarHeight = Platform.OS === 'ios' ? 49 : 56;
  // logo app
  largeLogo = 178;
  smallLogo = 89;

  // padding / margin
  veryTinyPadding = 4;
  tinyPadding = 8;
  verySmallPadding = 12;
  normalPadding = 14;
  smallPadding = 16;
  regularPadding = 20;
  primaryPadding = 24;
  largePadding = 32;
  superPadding = 64;

  // animation
  animScaleDown = 0.75;
  animScaleUp = 1.25;
  animScaleMargin = 0.25;
  fontSizeText = 15;

  // screen height level
  height_level =
    windowSize.height >= 812
      ? 'large'
      : windowSize.height >= 667
      ? 'medium'
      : 'small';
  bottomSheetHeight = windowSize.height * 0.8;
  smallStateHeight = 350;
  handleNavbarAndroid(isVisible: boolean) {
    if (isVisible) {
      if (Math.round(screenSize.height) > Math.round(windowSize.height)) {
        this.bottomSheetCreate = 220;
        this.bottomSheetNavbarAndroid = 40;
      }
      this.width = screenSize.width;
      this.height = screenSize.height;
      this.height_level =
        windowSize.height >= 812
          ? 'large'
          : windowSize.height >= 667
          ? 'medium'
          : 'small';
      this.bottomSheetHeight = windowSize.height * 0.8;
    } else {
      this.bottomSheetCreate = 180;
      this.bottomSheetNavbarAndroid = 0;
      this.width = screenSize.width;
      this.height = screenSize.height;
      this.height_level =
        screenSize.height >= 812
          ? 'large'
          : screenSize.height >= 667
          ? 'medium'
          : 'small';
      this.bottomSheetHeight = screenSize.height * 0.8;
    }
  }
}

export default new AppDimension();
