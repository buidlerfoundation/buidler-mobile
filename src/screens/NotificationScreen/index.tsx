import AppDimension from 'common/AppDimension';
import AppStyles from 'common/AppStyles';
import SVG from 'common/SVG';
import Touchable from 'components/Touchable';
import useThemeColor from 'hook/useThemeColor';
import React, {memo, useCallback} from 'react';
import {StyleSheet, Text, View} from 'react-native';

const NotificationScreen = () => {
  const {colors} = useThemeColor();
  const onPressMenu = useCallback(() => {}, []);
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text
          style={[styles.title, AppStyles.TextBold17, {color: colors.text}]}>
          Notification
        </Text>
        <Touchable onPress={onPressMenu}>
          <SVG.IconMore fill={colors.text} />
        </Touchable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: AppDimension.extraTop,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: AppDimension.headerHeight,
  },
  title: {
    marginLeft: 20,
    flex: 1,
  },
});

export default memo(NotificationScreen);
