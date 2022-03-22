import NavigationHeader from 'components/NavigationHeader';
import React, {useMemo, useState} from 'react';
import {View, StyleSheet, useWindowDimensions, Text} from 'react-native';
import {shuffle} from 'lodash';
import {createConfirmSeedState} from 'helpers/SeedHelper';
import AppDevice from 'common/AppDevice';
import Fonts from 'common/Fonts';
import {useTheme} from '@react-navigation/native';
import Touchable from 'components/Touchable';
import AppDimension from 'common/AppDimension';

type BackupScreenProps = {
  route: any;
};

const BackupScreen = ({route}: BackupScreenProps) => {
  const {colors} = useTheme();
  const seed: string = route.params?.seed || '';
  const {width} = useWindowDimensions();
  const [confirmSeed, setConfirmSeed] = useState(createConfirmSeedState());
  const shuffleSeedData = useMemo(() => shuffle(seed.split(' ')), [seed]);
  const space = AppDevice.isIphoneX ? 12 : 6;
  const seedWidth = useMemo(() => (width - 60 - space * 2) / 3, [width]);
  return (
    <View style={styles.container}>
      <NavigationHeader title="Store seed phrase" />
      <Touchable
        style={styles.buttonClear}
        onPress={() => setConfirmSeed(createConfirmSeedState())}>
        <Text style={[styles.textClear, {color: colors.subtext}]}>Clear</Text>
      </Touchable>
      <View style={styles.body}>
        <View style={[styles.seedView, {marginTop: 30}]}>
          {confirmSeed.map((el, index) => {
            const disabled = !el.title;
            const margin = index % 3 === 0 ? 0 : space;
            return (
              <Touchable
                style={[
                  styles.seedItem,
                  {
                    width: seedWidth,
                    justifyContent: !disabled ? 'flex-start' : 'center',
                    backgroundColor: !disabled
                      ? colors.border
                      : colors.activeBackgroundLight,
                    marginLeft: margin,
                    marginBottom: space,
                  },
                ]}
                key={el.title || index}
                disabled={disabled}
                onPress={() => {
                  setConfirmSeed(current =>
                    current.map((item, idx) => {
                      if (idx === index) {
                        item.title = '';
                      }
                      return item;
                    }),
                  );
                }}>
                <Text
                  style={[
                    styles.seedText,
                    {color: !disabled ? colors.text : colors.subtext},
                  ]}>
                  {el.title ? `${index + 1}. ${el.title}` : index + 1}
                </Text>
              </Touchable>
            );
          })}
        </View>
        <View style={[styles.seedView, {marginTop: 68}]}>
          {shuffleSeedData.map((el, index) => {
            const margin = index % 3 === 0 ? 0 : space;
            const disabled = !!confirmSeed.find(item => item.title === el);
            return (
              <Touchable
                style={[
                  styles.seedItem,
                  {
                    backgroundColor: colors.border,
                    width: seedWidth,
                    marginLeft: margin,
                    marginBottom: space,
                    justifyContent: 'center',
                  },
                ]}
                key={el}
                disabled={disabled}
                onPress={() => {
                  setConfirmSeed(current => {
                    const emptyIndex = current.findIndex(el => !el.title);
                    return current.map((item, index) => {
                      if (index === emptyIndex) {
                        item.title = el;
                      }
                      return item;
                    });
                  });
                }}>
                <Text
                  style={[
                    styles.seedText,
                    {color: disabled ? colors.activeBackground : colors.text},
                  ]}>
                  {el}
                </Text>
              </Touchable>
            );
          })}
        </View>
      </View>
      <Touchable style={[styles.buttonNext, {backgroundColor: colors.primary}]}>
        <Text style={[styles.textNext, {color: colors.text}]}>Next</Text>
      </Touchable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  body: {flex: 1},
  seedView: {
    paddingHorizontal: 30,
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  buttonClear: {
    alignSelf: 'flex-end',
    padding: 10,
    marginRight: 20,
  },
  textClear: {
    fontSize: 16,
    fontFamily: Fonts.SemiBold,
    lineHeight: 19,
  },
  buttonNext: {
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 30,
    borderRadius: 5,
    marginBottom: 20 + AppDimension.extraBottom,
  },
  textNext: {
    fontSize: 16,
    lineHeight: 19,
    fontFamily: Fonts.SemiBold,
  },
});

export default BackupScreen;
