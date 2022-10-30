import AppStyles from 'common/AppStyles';
import Touchable from 'components/Touchable';
import useThemeColor from 'hook/useThemeColor';
import React, {memo} from 'react';
import {StyleSheet, Text, ViewStyle} from 'react-native';

type MenuItemProps = {
  Icon: React.ReactNode;
  label: string;
  onPress?: () => void;
  style?: ViewStyle;
};

const MenuItem = ({style, label, Icon, onPress}: MenuItemProps) => {
  const {colors} = useThemeColor();
  return (
    <Touchable
      style={[styles.container, {backgroundColor: colors.border}, style]}
      onPress={onPress}>
      <Icon />
      <Text
        style={[AppStyles.TextSemi16, {color: colors.text, marginLeft: 15}]}>
        {label}
      </Text>
    </Touchable>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderRadius: 5,
  },
});

export default memo(MenuItem);
