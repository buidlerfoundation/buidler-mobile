import AppDimension from 'common/AppDimension';
import AppStyles from 'common/AppStyles';
import SVG from 'common/SVG';
import Touchable from 'components/Touchable';
import useThemeColor from 'hook/useThemeColor';
import React, {memo, useCallback} from 'react';
import {View, StyleSheet, Text} from 'react-native';

const NotificationHeader = () => {
  const {colors} = useThemeColor();
  const onPressMenu = useCallback(() => {}, []);
  return (
    <View style={styles.container}>
      <Text style={[styles.title, AppStyles.TextBold17, {color: colors.text}]}>
        Notification
      </Text>
      <Touchable onPress={onPressMenu}>
        <SVG.IconMore fill={colors.text} />
      </Touchable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: AppDimension.headerHeight,
    marginTop: AppDimension.extraTop,
  },
  title: {
    flex: 1,
  },
});

export default memo(NotificationHeader);
