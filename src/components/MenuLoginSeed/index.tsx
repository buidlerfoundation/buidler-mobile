import AppStyles from 'common/AppStyles';
import SVG from 'common/SVG';
import Touchable from 'components/Touchable';
import useThemeColor from 'hook/useThemeColor';
import React, {memo} from 'react';
import {View, StyleSheet, Text} from 'react-native';

type MenuLoginSeedProps = {
  onCreatePress: () => void;
  onImportPress: () => void;
};

const MenuLoginSeed = ({onCreatePress, onImportPress}: MenuLoginSeedProps) => {
  const {colors} = useThemeColor();
  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <Text
        style={[
          AppStyles.TextBold20,
          {color: colors.text, alignSelf: 'center'},
        ]}>
        Seed Phrase
      </Text>
      <Touchable
        style={[styles.button, {backgroundColor: colors.border, marginTop: 40}]}
        onPress={onCreatePress}
        useReactNative>
        <Text style={[AppStyles.TextSemi16, {color: colors.text}]}>
          Create New Wallet
        </Text>
        <View style={styles.icon}>
          <SVG.IconPlus width={16} height={16} fill={colors.text} />
        </View>
      </Touchable>
      <Touchable
        style={[styles.button, {backgroundColor: colors.border, marginTop: 15}]}
        onPress={onImportPress}
        useReactNative>
        <Text style={[AppStyles.TextSemi16, {color: colors.text}]}>
          Import Wallet
        </Text>
        <SVG.IconArrowImport fill={colors.text} />
      </Touchable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 5,
    paddingHorizontal: 30,
    paddingTop: 30,
    minHeight: 350,
  },
  button: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 5,
    paddingHorizontal: 20,
  },
  icon: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default memo(MenuLoginSeed);
