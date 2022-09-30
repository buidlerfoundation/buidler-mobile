import Fonts from 'common/Fonts';
import useThemeColor from 'hook/useThemeColor';
import React, {memo, useMemo} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import Toast from 'react-native-toast-message';

type ToastComponentProps = {
  type: 'success' | 'error' | 'information';
  title?: string;
  message: string;
};

const ToastComponent = ({type, title, message}: ToastComponentProps) => {
  const {colors} = useThemeColor();
  const titleColor = useMemo(() => {
    switch (type) {
      case 'success':
        return colors.success;
      case 'error':
        return colors.urgent;
      case 'information':
        return colors.text;
      default:
        return colors.success;
    }
  }, [colors.success, colors.text, colors.urgent, type]);
  return (
    <View
      style={[
        styles.toastContainer,
        {
          borderColor: colors.border,
          backgroundColor: colors.activeBackgroundLight,
        },
      ]}>
      <Text style={[styles.title, {color: titleColor}]}>{title || type}</Text>
      <Text style={[styles.message, {color: colors.text}]}>{message}</Text>
    </View>
  );
};

const ToastContainer = () => {
  const toastConfigs = useMemo(
    () => ({
      customSuccess: ({props}) => <ToastComponent {...props} type="success" />,
      customError: ({props}) => <ToastComponent {...props} type="error" />,
      customInfo: ({props}) => <ToastComponent {...props} type="information" />,
    }),
    [],
  );
  return <Toast config={toastConfigs} visibilityTime={2000} />;
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
    textTransform: 'capitalize',
  },
  message: {
    fontSize: 12,
    lineHeight: 20,
    fontFamily: Fonts.Medium,
    marginTop: 5,
  },
});

export default memo(ToastContainer);
