import ReactNativeBiometrics from 'react-native-biometrics';

const rnBiometrics = new ReactNativeBiometrics({allowDeviceCredentials: true});

export const biometricAuthenticate = () =>
  rnBiometrics.simplePrompt({promptMessage: 'Confirm fingerprint'});
