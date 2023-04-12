import KeyboardLayout from 'components/KeyboardLayout';
import NavigationHeader from 'components/NavigationHeader';
import React, {memo, useCallback, useMemo, useState} from 'react';
import {View, StyleSheet, TextInput, Text} from 'react-native';
import Fonts from 'common/Fonts';
import Touchable from 'components/Touchable';
import AppDevice from 'common/AppDevice';
import Clipboard from '@react-native-clipboard/clipboard';
import RNGoldenKeystore from 'react-native-golden-keystore';
import NavigationServices from 'services/NavigationServices';
import ScreenID from 'common/ScreenID';
import useThemeColor from 'hook/useThemeColor';
import {isValidPrivateKey} from 'helpers/SeedHelper';
import Toast from 'react-native-toast-message';
import {useRoute} from '@react-navigation/native';
import AppDimension from 'common/AppDimension';

const ImportSeedPhraseScreen = () => {
  const route = useRoute();
  const {colors, dark} = useThemeColor();
  const [seed, setSeed] = useState('');
  const fetchCopiedText = useCallback(async () => {
    const text = await Clipboard.getString();
    setSeed(text.toLowerCase());
  }, []);
  const onNextPress = useCallback(async () => {
    const isValid = await RNGoldenKeystore.mnemonicIsValid(seed);
    if (isValid === '1' || isValidPrivateKey(seed)) {
      NavigationServices.pushToScreen(ScreenID.CreatePasswordScreen, {seed});
      return;
    }

    Toast.show({type: 'customError', props: {message: 'Invalid seed phrase'}});
  }, [seed]);
  const onChangeSeed = useCallback(text => setSeed(text), []);
  const extraPaddingBottom = useMemo(() => {
    if (route.params?.importFromWC) {
      return -AppDimension.bottomTabbarHeight - AppDimension.extraBottom;
    }
    return 0;
  }, [route.params?.importFromWC]);
  return (
    <KeyboardLayout extraPaddingBottom={extraPaddingBottom}>
      <View style={styles.container}>
        <NavigationHeader title="Add seed phrase" />
        <View style={{flex: 1}}>
          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor: colors.activeBackgroundLight,
                borderColor: colors.border,
              },
            ]}>
            <TextInput
              style={[styles.input, {color: colors.text}]}
              placeholder="Your seed phrase"
              placeholderTextColor={colors.subtext}
              keyboardAppearance={dark ? 'dark' : 'light'}
              autoFocus
              autoCorrect={false}
              value={seed}
              onChangeText={onChangeSeed}
              multiline
              autoCapitalize="none"
            />
            <Touchable style={styles.buttonPaste} onPress={fetchCopiedText}>
              <Text style={[styles.textPaste, {color: colors.subtext}]}>
                Paste
              </Text>
            </Touchable>
          </View>
        </View>
        <Touchable
          style={[styles.buttonNext, {backgroundColor: colors.blue}]}
          onPress={onNextPress}>
          <Text style={[styles.textNext, {color: colors.text}]}>Next</Text>
        </Touchable>
      </View>
    </KeyboardLayout>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  inputWrapper: {
    marginHorizontal: 20,
    flexDirection: 'row',
    borderRadius: 5,
    borderWidth: 1,
    padding: 10,
    marginTop: AppDevice.isIphoneX ? 60 : 40,
  },
  input: {
    height: 130,
    flex: 1,
    padding: 10,
    fontFamily: Fonts.SemiBold,
    fontSize: 16,
    paddingTop: 8,
  },
  buttonPaste: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  textPaste: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Fonts.SemiBold,
  },
  buttonNext: {
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textNext: {
    fontSize: 16,
    lineHeight: 19,
    fontFamily: Fonts.SemiBold,
  },
});

export default memo(ImportSeedPhraseScreen);
