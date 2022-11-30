import useThemeColor from 'hook/useThemeColor';
import React, {memo, useMemo} from 'react';
import {View, StyleSheet, ViewStyle} from 'react-native';

type UnseenBadgeProps = {
  size?: number;
  border?: number;
  style: ViewStyle;
};

const UnseenBadge = ({size = 12, border = 2, style}: UnseenBadgeProps) => {
  const {colors} = useThemeColor();
  const childSize = useMemo(() => size - border * 2, [border, size]);
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.background,
        },
        styles.container,
        style,
      ]}>
      <View
        style={{
          width: childSize,
          height: childSize,
          borderRadius: childSize / 2,
          backgroundColor: colors.mention,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default memo(UnseenBadge);
