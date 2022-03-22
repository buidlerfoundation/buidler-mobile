import NavigationHeader from 'components/NavigationHeader';
import React, {useEffect, useMemo, useState} from 'react';
import {View, StyleSheet, Text, useWindowDimensions} from 'react-native';
import {useTheme} from '@react-navigation/native';
import Fonts from 'common/Fonts';
import RNGoldenKeystore from 'react-native-golden-keystore';
import AppDevice from 'common/AppDevice';
import Touchable from 'components/Touchable';
import SVG from 'common/SVG';
import NavigationServices from 'services/NavigationServices';
import ScreenID from 'common/ScreenID';

const StoreSeedPhraseScreen = () => {
  const [seed, setSeed] = useState('');
  const {width} = useWindowDimensions();
  const initialSeed = async () => {
    const res = await RNGoldenKeystore.generateMnemonic();
    setSeed(res);
  };
  useEffect(() => {
    initialSeed();
  }, []);
  const {colors} = useTheme();
  const space = AppDevice.isIphoneX ? 12 : 6;
  const seedWidth = useMemo(() => (width - 60 - space * 2) / 3, [width]);
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
        <Touchable style={[styles.buttonCopy]}>
          <SVG.IconCopy fill={colors.subtext} />
          <Text style={[styles.textCopy, {color: colors.subtext}]}>
            Copy to clipboard
          </Text>
        </Touchable>
      </View>
      <View style={styles.bottom}>
        <Touchable style={styles.buttonLater}>
          <Text style={[styles.textButton, {color: colors.subtext}]}>
            Do it later
          </Text>
        </Touchable>
        <Touchable
          style={[styles.buttonNext, {backgroundColor: colors.primary}]}
          onPress={() =>
            NavigationServices.pushToScreen(ScreenID.BackupScreen, {seed})
          }>
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
    paddingHorizontal: 30,
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
    marginLeft: 12,
    fontSize: 14,
    fontFamily: Fonts.SemiBold,
    lineHeight: 24,
  },
  bottom: {
    flex: 1,
    justifyContent: 'center',
  },
  buttonNext: {
    height: 60,
    marginTop: 10,
    marginHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
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

export default StoreSeedPhraseScreen;
