import * as Keychain from 'react-native-keychain';

const options: Keychain.Options = {
  accessible: Keychain.ACCESSIBLE.WHEN_PASSCODE_SET_THIS_DEVICE_ONLY,
  securityLevel: Keychain.SECURITY_LEVEL.SECURE_HARDWARE,
  authenticationType: Keychain.AUTHENTICATION_TYPE.BIOMETRICS,
};

export const storeCredentials = (pass: string) => {
  Keychain.setGenericPassword('buidler.app', pass, options);
};

export const getCredentials: () => Promise<Keychain.UserCredentials | null> =
  async () => {
    try {
      // Retrieve the credentials
      const credentials = await Keychain.getGenericPassword(options);
      if (credentials) {
        return credentials;
      } else {
        return null;
      }
    } catch (error) {
      console.log("Keychain couldn't be accessed!", error);
      return null;
    }
  };

export const removeCredentials = () => {
  Keychain.resetGenericPassword(options);
};
