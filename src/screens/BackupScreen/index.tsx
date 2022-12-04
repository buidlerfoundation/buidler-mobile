import NavigationHeader from 'components/NavigationHeader';
import React, {memo, useCallback, useMemo, useState} from 'react';
import {
  View,
  StyleSheet,
  useWindowDimensions,
  Text,
  ActivityIndicator,
} from 'react-native';
import {shuffle} from 'lodash';
import {createConfirmSeedState} from 'helpers/SeedHelper';
import AppDevice from 'common/AppDevice';
import Fonts from 'common/Fonts';
import Touchable from 'components/Touchable';
import AppDimension from 'common/AppDimension';
import useThemeColor from 'hook/useThemeColor';
import useAppDispatch from 'hook/useAppDispatch';
import {accessApp} from 'actions/UserActions';
import {useNavigation, useRoute} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import ScreenID from 'common/ScreenID';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AsyncKey} from 'common/AppStorage';
import useAccessingApp from 'hook/useAccessingApp';

type ShuffleSeedItemProps = {
  title: string;
  seedWidth: number;
  disabled: boolean;
  margin: number;
  space: number;
  onPress: (title: string) => void;
};

const ShuffleSeedItem = ({
  margin,
  space,
  seedWidth,
  disabled,
  title,
  onPress,
}: ShuffleSeedItemProps) => {
  const {colors} = useThemeColor();
  const handlePress = useCallback(() => onPress(title), [title, onPress]);
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
      disabled={disabled}
      onPress={handlePress}
      useReactNative>
      <Text
        style={[
          styles.seedText,
          {color: disabled ? colors.activeBackground : colors.text},
        ]}
        ellipsizeMode="tail"
        numberOfLines={1}>
        {title}
      </Text>
    </Touchable>
  );
};

type ConfirmSeedItemProps = {
  seedWidth: number;
  disabled: boolean;
  margin: number;
  space: number;
  index: number;
  title: string;
  onPress: (index: number) => void;
};

const ConfirmSeedItem = ({
  seedWidth,
  space,
  margin,
  index,
  title,
  disabled,
  onPress,
}: ConfirmSeedItemProps) => {
  const {colors} = useThemeColor();
  const handlePress = useCallback(() => onPress(index), [index, onPress]);
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
      disabled={disabled}
      onPress={handlePress}
      useReactNative>
      <Text
        style={[
          styles.seedText,
          {color: !disabled ? colors.text : colors.subtext},
        ]}
        ellipsizeMode="tail"
        numberOfLines={1}>
        {title ? `${index + 1}. ${title}` : index + 1}
      </Text>
    </Touchable>
  );
};

const BackupScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useAppDispatch();
  const {colors} = useThemeColor();
  const {seed, password, fromBackup} = useMemo(
    () => route.params,
    [route.params],
  );
  const {width} = useWindowDimensions();
  const [confirmSeed, setConfirmSeed] = useState(createConfirmSeedState());
  const shuffleSeedData = useMemo(() => shuffle(seed.split(' ')), [seed]);
  const space = useMemo(() => (AppDevice.isIphoneX ? 12 : 6), []);
  const seedWidth = useMemo(() => (width - 41 - space * 2) / 3, [space, width]);
  const accessingApp = useAccessingApp();
  const onNextPress = useCallback(() => {
    if (
      seed ===
      confirmSeed
        .map(el => el.title)
        .join(' ')
        .trim()
    ) {
      if (fromBackup) {
        Toast.show({
          type: 'customSuccess',
          props: {message: 'You have successfully backup your seed phrase.'},
        });
        AsyncStorage.removeItem(AsyncKey.encryptedSeedKey);
        navigation.navigate(ScreenID.ProfileScreen);
      } else {
        dispatch(accessApp?.(seed, password));
      }
    } else {
      alert('Invalid seed phrase');
    }
  }, [confirmSeed, dispatch, fromBackup, navigation, password, seed]);
  const onClearBackup = useCallback(
    () => setConfirmSeed(createConfirmSeedState()),
    [],
  );
  const onConfirmItemPress = useCallback((index: number) => {
    setConfirmSeed(current =>
      current.map((item, idx) => {
        if (idx === index) {
          item.title = '';
        }
        return item;
      }),
    );
  }, []);
  const handleShufflePress = useCallback((title: string) => {
    setConfirmSeed(current => {
      const emptyIndex = current.findIndex(el => !el.title);
      return current.map((item, index) => {
        if (index === emptyIndex) {
          item.title = title;
        }
        return item;
      });
    });
  }, []);
  return (
    <View style={styles.container}>
      <NavigationHeader title="Store seed phrase" />
      <Touchable style={styles.buttonClear} onPress={onClearBackup}>
        <Text style={[styles.textClear, {color: colors.subtext}]}>Clear</Text>
      </Touchable>
      <View style={styles.body}>
        <View style={[styles.seedView, {marginTop: 30}]}>
          {confirmSeed.map((el, index) => {
            const disabled = !el.title;
            const margin = index % 3 === 0 ? 0 : space;
            return (
              <ConfirmSeedItem
                key={el.title || index}
                seedWidth={seedWidth}
                margin={margin}
                disabled={disabled}
                index={index}
                title={el.title}
                onPress={onConfirmItemPress}
                space={space}
              />
            );
          })}
        </View>
        <View style={[styles.seedView, {marginTop: 68}]}>
          {shuffleSeedData.map((el, index) => {
            const margin = index % 3 === 0 ? 0 : space;
            const disabled = !!confirmSeed.find(item => item.title === el);
            return (
              <ShuffleSeedItem
                key={el}
                title={el}
                seedWidth={seedWidth}
                margin={margin}
                disabled={disabled}
                onPress={handleShufflePress}
                space={space}
              />
            );
          })}
        </View>
      </View>
      <Touchable
        style={[styles.buttonNext, {backgroundColor: colors.blue}]}
        onPress={onNextPress}
        disabled={accessingApp}>
        {accessingApp ? (
          <ActivityIndicator color={colors.text} />
        ) : (
          <Text style={[styles.textNext, {color: colors.text}]}>Next</Text>
        )}
      </Touchable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  body: {flex: 1},
  seedView: {
    paddingHorizontal: 20,
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
    fontSize: AppDevice.isIphoneX ? 15 : 13,
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
    marginHorizontal: 20,
    borderRadius: 5,
    marginBottom: 30 + AppDimension.extraBottom,
  },
  textNext: {
    fontSize: 16,
    lineHeight: 19,
    fontFamily: Fonts.SemiBold,
  },
});

export default memo(BackupScreen);
