import Fonts from 'common/Fonts';
import useThemeColor from 'hook/useThemeColor';
import React, {memo, useMemo} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import Toast from 'react-native-toast-message';

const ToastContainer = () => {
  const {colors} = useThemeColor();
  const toastConfigs = useMemo(
    () => ({
      customSuccess: ({props}) => {
        return (
          <View
            style={[
              styles.toastContainer,
              {
                borderColor: colors.border,
                backgroundColor: colors.activeBackgroundLight,
              },
            ]}>
            <Text style={[styles.title, {color: colors.success}]}>
              {props?.title || 'Success'}
            </Text>
            <Text style={[styles.message, {color: colors.text}]}>
              {props?.message}
            </Text>
          </View>
        );
      },
      customError: ({props}) => {
        return (
          <View
            style={[
              styles.toastContainer,
              {
                borderColor: colors.border,
                backgroundColor: colors.activeBackgroundLight,
              },
            ]}>
            <Text style={[styles.title, {color: colors.urgent}]}>
              {props?.title || 'Error'}
            </Text>
            <Text style={[styles.message, {color: colors.text}]}>
              {props?.message}
            </Text>
          </View>
        );
      },
    }),
    [
      colors.activeBackgroundLight,
      colors.border,
      colors.success,
      colors.text,
      colors.urgent,
    ],
  );
  return <Toast config={toastConfigs} />;
};

const styles = StyleSheet.create({
  toastContainer: {
    borderRadius: 5,
    borderWidth: 1,
    width: '90%',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  title: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: Fonts.SemiBold,
  },
  message: {
    fontSize: 12,
    lineHeight: 20,
    fontFamily: Fonts.Medium,
    marginTop: 5,
  },
});

export default memo(ToastContainer);
