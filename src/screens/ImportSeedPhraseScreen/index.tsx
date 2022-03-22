import KeyboardLayout from 'components/KeyboardLayout';
import NavigationHeader from 'components/NavigationHeader';
import React, {useState} from 'react';
import {View, StyleSheet, TextInput, Text} from 'react-native';
import {useTheme} from '@react-navigation/native';
import Fonts from 'common/Fonts';
import Touchable from 'components/Touchable';
import AppDevice from 'common/AppDevice';

const ImportSeedPhraseScreen = () => {
  const {colors, dark} = useTheme();
  const [seed, setSeed] = useState('');
  return (
    <KeyboardLayout>
      <View style={styles.container}>
        <NavigationHeader title="Add seed phrase" />
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
            onChangeText={text => setSeed(text)}
            multiline
          />
          <Touchable style={styles.buttonPaste}>
            <Text style={[styles.textPaste, {color: colors.subtext}]}>
              Paste
            </Text>
          </Touchable>
        </View>
        <Touchable
          style={[styles.buttonNext, {backgroundColor: colors.primary}]}>
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
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textNext: {
    fontSize: 16,
    lineHeight: 19,
    fontFamily: Fonts.SemiBold,
  },
});

export default ImportSeedPhraseScreen;
