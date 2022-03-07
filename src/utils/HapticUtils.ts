import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

class HapTicUtils {
  options = {
    enableVibrateFallback: true,
    ignoreAndroidSystemSettings: true,
  };

  trigger = (
    type: ReactNativeHapticFeedback.HapticFeedbackTypes = 'impactMedium',
    options = this.options,
  ) => {
    ReactNativeHapticFeedback.trigger(type, options);
  };
}

export default new HapTicUtils();
