import React from 'react';
import {View, StyleSheet, Text} from 'react-native';
import {useTheme} from '@react-navigation/native';
import Fonts from 'common/Fonts';

type PasswordLevelProps = {
  level: number;
};

const PasswordLevel = ({level}: PasswordLevelProps) => {
  const {colors} = useTheme();
  if (level === 0) return null;
  const levelObj = () => {
    if (level <= 2) {
      return {
        label: 'Weak',
        size: 66,
        color: colors.text,
      };
    }
    if (level === 3) {
      return {
        label: 'Good',
        size: 134,
        color: colors.success,
      };
    }
    return {
      label: 'Excellent',
      size: 200,
      color: colors.success,
    };
  };
  const {label, color, size} = levelObj();
  return (
    <View style={styles.container}>
      <Text style={[styles.text, {color}]}>{label}</Text>
      <View style={[styles.view, {backgroundColor: color, width: size}]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    marginLeft: 40,
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontSize: 12,
    lineHeight: 24,
    fontFamily: Fonts.SemiBold,
  },
  view: {
    height: 8,
    borderRadius: 2,
    marginLeft: 10,
  },
});

export default PasswordLevel;
