import NavigationHeader from 'components/NavigationHeader';
import React, {memo, useCallback, useEffect, useMemo, useState} from 'react';
import {View, StyleSheet, Text, useWindowDimensions} from 'react-native';
import Fonts from 'common/Fonts';
import RNGoldenKeystore from 'react-native-golden-keystore';
import AppDevice from 'common/AppDevice';
import Touchable from 'components/Touchable';
import SVG from 'common/SVG';
import NavigationServices from 'services/NavigationServices';
import ScreenID from 'common/ScreenID';
import AppDimension from 'common/AppDimension';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AuthStackParamsList} from 'navigation/AuthStack';
import useThemeColor from 'hook/useThemeColor';
import useAppDispatch from 'hook/useAppDispatch';
import {accessApp} from 'actions/UserActions';
import Clipboard from '@react-native-clipboard/clipboard';
import Toast from 'react-native-toast-message';

type Props = NativeStackScreenProps<
  AuthStackParamsList,
  'StoreSeedPhraseScreen'
>;

const StoreSeedPhraseScreen = ({route}: Props) => {
  const dispatch = useAppDispatch();
  const {password} = useMemo(() => route.params, [route.params]);
  const [seed, setSeed] = useState('');
  const {width} = useWindowDimensions();
  const initialSeed = useCallback(async () => {
    const res = await RNGoldenKeystore.generateMnemonic();
    setSeed(res);
  }, []);
  useEffect(() => {
    initialSeed();
  }, [initialSeed]);
  const {colors} = useThemeColor();
  const space = useMemo(() => (AppDevice.isIphoneX ? 12 : 6), []);
  const seedWidth = useMemo(() => (width - 41 - space * 2) / 3, [space, width]);
  const onNextPress = useCallback(() => {
    NavigationServices.pushToScreen(ScreenID.BackupScreen, {seed, password});
  }, [password, seed]);
  const onCopy = useCallback(async () => {
    await Clipboard.setString(seed);
    Toast.show({type: 'customSuccess', props: {message: 'Copied'}});
  }, [seed]);
  const onLaterPress = useCallback(() => {
    dispatch(accessApp?.(seed, password));
  }, [dispatch, password, seed]);
  return (
    <View style={styles.container}>
      <NavigationHeader title="Store seed phrase" />
      <View style={styles.body}>
        <Text style={[styles.description, {color: colors.subtext}]}>
          The only way to import/ recover your wallet. Note down in safe place
          and never share to anyone
        </Text>
        <View style={styles.seedView}>
          {seed.split(' ').map((el, index) => {
            const margin = index % 3 === 0 ? 0 : space;
            return (
              <View
                style={[
                  styles.seedItem,
                  {
                    backgroundColor: colors.border,
                    width: seedWidth,
                    marginLeft: margin,
                    marginBottom: space,
                  },
                ]}
                key={el}>
                <Text style={[styles.seedText, {color: colors.text}]}>
                  {index + 1}. {el}
                </Text>
              </View>
            );
          })}
        </View>
        <Touchable style={[styles.buttonCopy]} onPress={onCopy}>
          <SVG.IconCopy fill={colors.subtext} />
          <Text style={[styles.textCopy, {color: colors.subtext}]}>
            Copy to clipboard
          </Text>
        </Touchable>
      </View>
      <View style={styles.bottom}>
        <Touchable style={styles.buttonLater} onPress={onLaterPress}>
          <Text style={[styles.textButton, {color: colors.subtext}]}>
            Do it later
          </Text>
        </Touchable>
        <Touchable
          style={[styles.buttonNext, {backgroundColor: colors.primary}]}
          onPress={onNextPress}>
          <Text style={[styles.textButton, {color: colors.text}]}>Next</Text>
        </Touchable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  body: {
    marginTop: 25,
    paddingHorizontal: 20,
    flex: 1,
  },
  description: {
    fontSize: 16,
    fontFamily: Fonts.SemiBold,
    lineHeight: 24,
  },
  seedView: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 26,
  },
  seedItem: {
    height: 32,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  seedText: {
    fontSize: AppDevice.isIphoneX ? 16 : 14,
    lineHeight: 24,
    fontFamily: Fonts.SemiBold,
  },
  buttonCopy: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 30,
  },
  textCopy: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: Fonts.SemiBold,
    lineHeight: 24,
  },
  bottom: {
    justifyContent: 'center',
  },
  buttonNext: {
    height: 60,
    marginTop: 10,
    marginHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    marginBottom: AppDimension.extraBottom + 30,
  },
  buttonLater: {
    alignSelf: 'center',
    padding: 5,
  },
  textButton: {
    fontSize: 16,
    lineHeight: 19,
    fontFamily: Fonts.SemiBold,
  },
});

export default memo(StoreSeedPhraseScreen);
